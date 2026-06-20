export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('portfolioFile') as File | null;

    if (!file) {
      return new Response(null, {
        status: 303,
        headers: { Location: '/?shared=error' },
      });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString('base64');
    const mimeType = file.type || 'application/octet-stream';
    const name = file.name || 'shared_file.lens';

    // We return an HTML page that runs client-side JS to save the file
    // directly into IndexedDB, avoiding any server-side storage.
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Importing Portfolio...</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { background: #000; color: #fff; font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
            .loader { border: 4px solid rgba(255,255,255,0.1); border-left-color: #00f2fe; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; }
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          </style>
        </head>
        <body>
          <div class="loader"></div>
          <script>
            try {
              const base64 = "${base64}";
              const byteString = atob(base64);
              const ab = new ArrayBuffer(byteString.length);
              const ia = new Uint8Array(ab);
              for (let i = 0; i < byteString.length; i++) {
                  ia[i] = byteString.charCodeAt(i);
              }
              const blob = new Blob([ab], {type: "${mimeType}"});
              const file = new File([blob], "${name}", {type: "${mimeType}"});

              const request = indexedDB.open('EtfPortfolioDB', 1);
              
              request.onupgradeneeded = (e) => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains('etf_store')) {
                  db.createObjectStore('etf_store');
                }
              };

              request.onsuccess = (e) => {
                const db = e.target.result;
                const tx = db.transaction('etf_store', 'readwrite');
                const store = tx.objectStore('etf_store');
                
                const putReq = store.put({ file: file, timestamp: Date.now() }, 'shared_portfolio_file');
                putReq.onsuccess = () => {
                  window.location.replace('/?shared=true');
                };
                putReq.onerror = () => {
                  window.location.replace('/?shared=error');
                };
              };
              
              request.onerror = () => {
                window.location.replace('/?shared=error');
              };
            } catch (err) {
              window.location.replace('/?shared=error');
            }
          </script>
        </body>
      </html>
    `;

    return new Response(html, {
      status: 200,
      headers: { 'Content-Type': 'text/html' },
    });
  } catch (error) {
    console.error('Error in share-target API:', error);
    return new Response(null, {
      status: 303,
      headers: { Location: '/?shared=error' },
    });
  }
}
