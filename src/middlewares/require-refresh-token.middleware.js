import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prisma.util.js';
import 'dotenv/config'; 

export default async function (req, res, next) {
 try{
    const authorization =req.headers['authorization']
    if(!authorization){
        return res.status(401).json({errorMessage: '인증정보가 없습니다.'})
    }

    const [tokenType, refreshToken] = authorization.split(' ');
    if (tokenType !== 'Bearer'){
        return res.status(401).json({errorMessage: '토큰타입이 일치하지 않습니다.'})
    }

    const decodedToken = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET_KEY);
    const userId = decodedToken.userId;

    const user = await prisma.users.findFirst({
        where: { userId: +userId},
    })
    if(!user) {
        return res.status(401).json({errorMessage: '인증정보에 해당하는 사용자가 존재하지 않습니다.'})
    }
    const storedRefreshToken = await prisma.refreshToken.findFirst({
        where: { userId: userId },
      });
    
      if (!storedRefreshToken ) {
        return res.status(401).json({ message: '폐기된 인증 정보입니다.' });
      }
  
      req.user = user;
      next();
 } catch(error){
    return res.status(401).json({message:error.message ?? '비정상적인 요청입니다.'})
 }
}
