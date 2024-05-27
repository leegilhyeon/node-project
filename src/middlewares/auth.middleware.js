import jwt from 'jsonwebtoken';

export default async function (req, res) {
   try{
    //cookie 전달받아오기
    const { authorization } = req.cookies;  //cookie:authorization 객체구조분해 할당
    //쿠키가 Bearer 형식의 토큰인지 확인하기
    const [tokenType, token] = authorization.split(' ') //왼쪽(tokenType)에는 배열 오른쪽(token)에는 토큰으로 구성되어있기 때문에 스페이스 기준으로 자른다 
    if(tokenType !== 'Bearer') throw new Error('토큰 타입이 일치하지 않습니다.');

    //발급한 jwt 검증
    const decodedToken = jwt.verify(token, 'secret_key'); //시크릿 키가 일치하다면 decodedToken에 정보전달해준다
    const userId = decodedToken.userId;

   } catch( error ) {
     res.clearCookie('authorization'); // 인증에 실패한 특정 쿠키 삭제
    //에러종류를 상세히 구분하기위해 사용
    switch(error) {
        case 'TokenExpiredError': //토근이 만료되었을 때 발생하는 에러
          return res.status(401).json({message:'토근이 만료되었습니다.'});
          
        case 'JsonWebTokenError': //토큰 검증에 실패했을 때 발생
          return res.status(401).json({message:'토큰 인증에 실패하였습니다.'});
          
        default:
          return res.status(401).json({message:error.message ?? '비정상적인 요청입니다.'}); //에러에 있는 메세지가 존재할때만 출력
    }
    
   }
}