Here are several ideas to improve the mobile usability of your ETF Portfolio Analyzer, categorized by different areas of the application:

### 1. Dashboard TabNavigation

- Current State: The tabs (Overview, Deep Dive, 3D Visuals, etc.) are in a horizontally scrollable container (overflow-x-auto ). While this works,
  it can be easily missed if the user doesn't realize they canswipe.
- MobileImprovements:
  - Dropdown/Select Menu: Replace the scrollable tab row with a native-feeling Dropdown or Select menu on mobile. Thistakes up less vertical  
    space and immediately shows the user all availablesections.
  - Bottom Navigation Bar: For the most critical tabs (e.g., Overview, Visuals, Settings), consider a fixed bottomnavigation bar (like an app)
    for easy one-handed thumbaccess.
  - Accordion Layout: Instead of tabs, render the sections as collapsible accordions on mobile so users can expand thesections they care about
    as they scrolldown.

### 2. Handling 3D Visualizations &Charts

- Current State: The 3D Exposure Globe and Network Graph are deeplyinteractive.
- MobileImprovements:
  - Scroll Trapping Prevention: 3D canvases often "steal" touch gestures, making it hard to scroll past them on mobile.Ensure that touch  
    gestures on the 3D canvases require two fingers to rotate/pan, or add a dedicated "pan/scroll" area aroundthem.
  - Full-Screen Mode: Give users a button to expand the 3D visuals into a full-screen modal. This makes interaction mucheasier and prevents  
    accidental pagescrolling.

### 3. Space Management & Layout(KPIs)

- Current State: The top KPI cards (Average TER, Total Assets, Active ETFs) stack vertically on mobile ( grid-cols-1 ),pushing the actual charts
  and deep-dive data further down below thefold.
- MobileImprovements:
  - Horizontal Swipeable Carousel: Place the KPI cards in a horizontal, snap-scrolling row ( snap-x flex overflow-x-auto ).This keeps all KPIs
    "above the fold" without sacrificing verticalspace.
  - Compact Badges: Instead of large, padded cards, condense the KPIs into a sticky header strip or mini-badges just belowthe navbar.

### 4. Touch Targets & Inputs (Sliders &Forms)

- Current State: You use custom sliders for ETF allocation and Network Graph physicslimits.
- MobileImprovements:
  - Thumb-Friendly Touch Targets: Ensure the "thumbs" on your <Slider /> components are at least 44x44px to meet mobileaccessibility  
    standards.
  - Numeric Inputs: If users type in weights or savings plan numbers, ensure the inputs use inputMode="decimal" so thephone automatically  
    brings up the number pad instead of the full QWERTYkeyboard.
  - Floating Action Button (FAB): If there is a primary action (like "Upload CSV" or "Add ETF"), place a floating button inthe bottom right  
    corner so it's always accessible with athumb.

### 5. Typography & Reading Experience

- Mobile Improvements:
  - Ensure the very large text on the landing page ( text-5xl ) doesn't cause awkward word breaks on narrow screens (likean iPhone SE). You  
    might want to use fluid typography ( clamp() ) or dial it down to text-4xl .
  - Maximize screen real estate by reducing page margins/padding from px-4 to px-2 or px-3 specifically for thecomplex chart views.
