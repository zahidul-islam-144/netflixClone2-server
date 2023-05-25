exports.validationErrorHandler = (results, res) => {
    // console.log("💛 results:validationErrorHandler:", results);
  let errorObj = {};
  results.errors.map((i) => (errorObj[i.param] = i.msg));
  // console.log("💛 errorObj:", errorObj);

  res.status(400).json({
    success: false,
    message: errorObj,
  });
};
