export default (sequelize, Sequelize) => {
  const Material = sequelize.define('material', {
    title: { type: Sequelize.STRING },
    type: { type: Sequelize.STRING },
    url: { type: Sequelize.STRING }
  });
  return Material;
};