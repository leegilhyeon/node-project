import express from 'express';
import {prisma} from './index.js';
import accessMiddleware from '../middlewares/require-access-token.middleware.js';
import refreshTokenMiddleware from '../middlewares/require-refresh-token.middleware.js';
const router = express.Router();

//사용자 조회

//정보조회 
router.get('/users', accessMiddleware, async(req,res)=> {
    try{ 
        const {userId} = req.user;
    
        const user = await prisma.users.findFirst({
        where: { userId: +userId},
        select : {
            userId: true,
            email: true,
            name: true,
            UserInfos: {
              select: {
                role: true,
                createdAt: true,
                updatedAt: true
              }
        }}
      })
    
        const userInfo = await prisma.userInfos.findFirst({
            where: {userId: +userId},
            
        });
        if(userInfo){
            user.role = userInfo.role;
        }
        return res.status(200).json({data: user})
    } catch (err) {
        next(err);
    }
    
    });


    export default router;