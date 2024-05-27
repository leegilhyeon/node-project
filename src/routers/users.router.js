import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prisma.util.js';

const router = express.Router();

router.post('/sign-up', async (req, res) => {
    const {email, password,passwordCheck, name} =req.body
    const isExistUser = await prisma.users.findFirst({
        where: {
            email,
        },
    });
    if (isExistUser) {
        return res.status(409).json({message: '이미 존재하는 이메일입니다.'})
    }
    if (password !== passwordCheck) {
    return res.status(400).json({message:'비밀번호가 일치하지 않습니다.'})
    }
    //Users 테이블에 사용자 추가
    // const user = await prisma.users.create({
    //     data : { email, password},
    // });
    const hashedPassword = await bcrypt.hash(password, 10);
    //Users 테이블에 사용자 정보 추가
    const user = await prisma.users.create({
        data: {
            email,
            password:hashedPassword,
            UserInfos: {
                create: {
                    name,
                    // role,
                },
            },
        },
      });
    // const userInfo = await prisma.userInfos.create({
    //     data: {
    //         userId: user.userId,
    //         email,
    //         name,
    //         // role:{
    //         //     default:"APPLICANT"
    //         // }
    //     }
    // });
    return res.status(201).json({message:'회원가입이 완료되었습니다.'})
});
// 서비스 사용을 위해 인증을 진행합니다.

// 1. **요청 정보**
//     - **이메일, 비밀번호**를 **Request Body**(`**req.body**`)로 전달 받습니다.
// 2. **유효성 검증 및 에러 처리**
//     - **로그인 정보 중 하나라도 빠진 경우** - “OOO을 입력해 주세요.”
//     - **이메일 형식에 맞지 않는 경우** - “이메일 형식이 올바르지 않습니다.”
//     - **이메일로 조회되지 않거나 비밀번호가 일치하지 않는 경우** - “인증 정보가 유효하지 않습니다.”
// 3. **비즈니스 로직(데이터 처리)**
//     - **AccessToken(Payload**에 **`사용자 ID`**를 포함하고, **유효기한**이 **`12시간`)**을 생성합니다.
// 4. **반환 정보**
//     - **AccessToken**을 반환합니다.
router.post('/sign-in', async(req, res) => {
    const { email, password } = req.body;
    //전달받은 email을 가진 사용자가 있는 지 확인
    const user = await prisma.users.findFirst({where:{email}});
    if(!user) {
        return res.status(401).json({message:'존재하지 않는 이메일입니다.'})
    }
    const pass = await bcrypt.compare(password, user.password);
    if(!pass) {
        return res.status(401).json({message:'비밀번호가 일치하지 않습니다.'})
    }
    console.log(password,user.passsword)
    const token = jwt.sign(
        {
            userId: user.userId,
        },
        'secret_key',
    )

    res.cookie('authorization', `Bearer ${token}`);
    return res.status(200).json({message:'로그인 성공했습니다.'});
})
export default router;