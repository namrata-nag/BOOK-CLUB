const generateUpdateExpression = (arr, exclude = []) => {
  let objKeys = Object.keys(arr).filter(i => !exclude.includes(i));
  return objKeys.map(str => {
    return `${str} = :${str}`;
  });
};
const generateExpressionValue = (arr, exclude = []) => {
  let objKeys = Object.keys(arr);
  return objKeys.reduce((acc, obj) => {
    if (!exclude.includes(obj)) acc[`:${obj}`] = arr[obj];
    return acc;
  }, {});
};

module.exports = {
  generateExpressionValue,
  generateUpdateExpression,
};
