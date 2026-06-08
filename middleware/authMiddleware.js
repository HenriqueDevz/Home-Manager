const jwt = require("jsonwebtoken");
function authMiddleware(req, res, next) {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({message: "Não autenticado" });
    }
    
    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.user = payload;
        next();

      } catch (err) {
        return res.status(401).json({message: "Token invalido" });
      }  
}

module.exports = authMiddleware;