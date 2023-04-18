module.exports = (asyncFun) => (req, res, next) => {
  Promise.resolve(asyncFun(req, res, next)).catch(next)
}




/*
function asyncTryCatchMiddleware(handler){
  return async(req, res, next)=>{
    try{
      await handler(req,res);
    }catch(err){
      next(err);
    }
  }
}

*/