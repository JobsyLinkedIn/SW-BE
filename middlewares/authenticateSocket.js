import jwt from 'jsonwebtoken';

const authenticateSocket = (socket, next) => {
  try {
    // 1. Extract token from handshake
    const token = socket.handshake.auth.token; // or from query/socket.handshake.headers
    //console.log(socket)
    // 2. Verify token exists
    if (!token) {
      const err = new Error('Socket Authentication error: No Token Provided');
      throw err;
    }

    // 3. Verify token validity
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // 4. Attach user to socket for future use
    socket.request.user = decoded;

    // 5. Allow connection to proceed
    next();
  } catch (error) {
    // 6. Deny connection if auth fails
    const errorMessage = `Authentication failed : ${error.message}`;
    next(new Error(errorMessage));
  }
};

export { authenticateSocket };
