module.exports = {
  voronoiTreemap: () => {
    const layout = () => {};
    layout.clip = () => layout;
    layout.extent = () => layout;
    layout.size = () => layout;
    return layout;
  },
};
