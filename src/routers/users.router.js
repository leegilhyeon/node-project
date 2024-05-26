import express from 'express';
import { prisma } from '../utils/prisma.util';  

const router = express.Router();

router.post('/sign-up', async (req, res) => {
    const {email, password, name} =req.body
    const isExistUser = await prisma.users.findFirst({
        where: {
            email,
        },
    });
    if (isExistUser) {
        return res.status(409).json({message: '이미 존재하는 이메일입니다.'})
    }
    //Users 테이블에 사용자 추가
    const user = await prisma.users.create({
        data : { email, password},
    });
    //Users 테이블에 사용자 정보 추가
    const userInfo = await prisma.userInfos.create({
        data: {
            userId: user.userId,
            email,
            name,
            role,
        }
    })

})
