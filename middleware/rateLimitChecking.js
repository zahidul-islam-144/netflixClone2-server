const redis = require("redis");
const moment = require("moment");
const requestIp = require('request-ip');
const ErrorResponse = require("../error_handler/errorResponse");
const { redisClient } = require("../config/redisConfig");



// sliding-window-counter-algorithm::
exports.rateLimitCheckingMiddleware = (req, res, next) => {
  const clientIp = requestIp.getClientIp(req).split(':')[3];
  console.log('💛clientIP:',`Your IP Address is ${clientIp}.`)
  // console.log('💛req:',req)
  redisClient.exists(clientIp, (err, reply) => {
    console.log("💛inside-redis")
    if (err) {
      console.log("💛if-1",err)
      throw new ErrorResponse(err,500);
      system.exit(0);
    }

    if (reply === 1) {
      console.log("💛if-2")
      redisClient.get(clientIp, (err, redisResponse) => {
        let data = JSON.parse(redisResponse);
        console.log("💛data:", data)

        let currentTime = moment().unix();
        console.log("💛currentTime:", currentTime)
        let lessThanMinuteAgo = moment().subtract(1, "minute").unix();
        console.log("💛lessThanMinuteAgo:", lessThanMinuteAgo)

        let RequestCountPerMinutes = data.filter((item) => {
          return item.requestTime > lessThanMinuteAgo;
        });

        let thresHold = 0;

        RequestCountPerMinutes.forEach((item) => {
          thresHold = thresHold + item.counter;
        });

        if (thresHold >= 5) {
          console.log("💛if-3")
          return next(new ErrorResponse('Throttle exceed limit.',500));
        } else {
          let isFound = false;
          data.forEach((element) => {
            if (element.requestTime) {
              isFound = true;
              element.counter++;
            }
          });
          if (!isFound) {
            data.push({
              requestTime: currentTime,
              counter: 1,
            });
          }

          redisClient.set(clientIp, JSON.stringify(data));

          next();
        }
      });
    } else {
      let data = [];
      let requestData = {
        requestTime: moment().unix(),
        counter: 1,
      };
      data.push(requestData);
      redisClient.set(clientIp, JSON.stringify(data));

      next();
    }
  });
};

/// updated

// const redis = require("redis");
// const moment = require("moment");
// const requestIp = require('request-ip');
// const ErrorResponse = require("../error_handler/errorResponse");
// const { redisClient } = require("../config/redisConfig");

// // sliding-window-counter-algorithm
// exports.rateLimitCheckingMiddleware = (req, res, next) => {
//   const clientIp = requestIp.getClientIp(req).split(':')[3];
//   const windowSizeInMinutes = 1; // Define the time window in minutes
//   const maxRequestsPerWindow = 5; // Define the maximum allowed requests per time window

//   redisClient.exists(clientIp, (err, reply) => {
//     if (err) {
//       return next(new ErrorResponse(err, 500));
//     }

//     if (reply === 1) {
//       redisClient.get(clientIp, (err, redisResponse) => {
//         if (err) {
//           return next(new ErrorResponse(err, 500));
//         }

//         let data = JSON.parse(redisResponse || '[]');
//         const currentTime = moment().unix();
//         const lessThanWindowAgo = moment().subtract(windowSizeInMinutes, "minutes").unix();

//         // Filter requests within the time window
//         const requestsWithinWindow = data.filter(item => item.requestTime > lessThanWindowAgo);

//         // Calculate total requests made within the time window
//         const totalRequestsWithinWindow = requestsWithinWindow.reduce((acc, item) => acc + item.counter, 0);

//         if (totalRequestsWithinWindow >= maxRequestsPerWindow) {
//           return next(new ErrorResponse('Throttle exceed limit.', 429)); // Return HTTP 429: Too Many Requests
//         } else {
//           // Update or add request count within the window
//           const existingRequestIndex = requestsWithinWindow.findIndex(item => item.requestTime === currentTime);
//           if (existingRequestIndex !== -1) {
//             data[data.indexOf(requestsWithinWindow[existingRequestIndex])].counter++;
//           } else {
//             data.push({
//               requestTime: currentTime,
//               counter: 1,
//             });
//           }

//           redisClient.set(clientIp, JSON.stringify(data));
//           next();
//         }
//       });
//     } else {
//       const requestData = [{
//         requestTime: moment().unix(),
//         counter: 1,
//       }];
//       redisClient.set(clientIp, JSON.stringify(requestData));
//       next();
//     }
//   });
// };
