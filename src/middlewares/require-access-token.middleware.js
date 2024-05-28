import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prisma.util.js';
import 'dotenv/config'; 

export default async function (req, res, next) {
    //
    try{ 
        const authorization = req.headers['authorization'];
    
    if(!authorization) {
        return res.status(401).json({errorMessage: '인증정보가 없습니다.'})
    }
    //토큰이 Bearer 형식인지 검증
    const [tokenType, accessToken] = authorization.split(' ');
    if(tokenType !== 'Bearer') {
        throw new Error('토큰 타입이 일치하지 않습니다.');
    }
    //발급한 jwt 검증
    const decodedToken = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET_KEY); //시크릿 키가 일치하다면 decodedToken에 정보전달해준다
    const userId = decodedToken.userId;

    const user = await prisma.user.findFirst({
        where: { userId: +userId},
    })
    if (!user) {
        //res.clearCookie('authorization');
        throw new Error('인증정보에 해당하는 사용자가 존재하지 않습니다.');
    }

    req.user = user; //req.user에 조회된 사용자 정보 할당

    next();
    }
    catch( error ) {
        res.clearCookie('authorization'); // 인증에 실패한 특정 쿠키 삭제
       //에러종류를 상세히 구분하기위해 사용
       switch(error.name) { //error 객체의 name속성 사용한다
           case 'TokenExpiredError': //토근이 만료되었을 때 발생하는 에러
             return res.status(401).json({message:'인증이 만료되었습니다.'});
             
           case 'JsonWebTokenError': //토큰 검증에 실패했을 때 발생
             return res.status(401).json({message:'인증에 실패하였습니다.'});
             
           default:
             return res.status(401).json({message:error.message ?? '비정상적인 요청입니다.'}); //에러에 있는 메세지가 존재할때만 출력
       }
       
      }
    };
//     const payload =validateToken(accessToken, ACCESS_TOKEN_SECRET_KEY);
//     if (!payload){
//         return res.status(401).json({errorMessage: 'Access Token이 정상적이지 않습니다.'})
//     }

//     const { id } = payload;
//     return res.status(200).json({message: `${id}의 Token이 정상적으로 인증되었습니다.`});
// }

// function validateToken (token, secretKey) {
//     try {
//         return jwt.verify(token, secretKey);
//     } catch (err) {
//         return null;
//     }
// }