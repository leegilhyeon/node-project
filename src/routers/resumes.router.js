import express from 'express';
import { prisma } from './index.js';
import accessMiddleware from '../middlewares/require-access-token.middleware.js';


const router = express.Router();

// - 사용자 정보는 **인증 Middleware(`req.user`)**를 통해서 전달 받습니다.
// - **제목, 자기소개**를 **Request Body**(`**req.body**`)로 전달 받습니다.
// - **작성자 ID**는 인증 Middleware에서 전달 받은 정보를 활용합니다.
// - **이력서 ID, 지원 상태, 생성일시, 수정일시**는 ****자동 생성됩니다.
// - **지원 상태**의 종류는 다음과 같으며, 기본 값은 **`APPLY`** 입니다
// 이력서 ID, 작성자 ID, 제목, 자기소개, 지원 상태, 생성일시, 수정일시를 반환
router.post('/post', accessMiddleware, async(req, res) =>{
    //유저정보에서 유저아이디만 가져오기
    const {userId} = req.user;

    const {title, introduction} = req.body;

    const resume = await prisma.resumes.create({
        data:{
            UserId: userId,
            title,
            introduction,
        },
    });
    return res.status(201).json({data: resume});
})

//이력서 목록
router.get('/resumes', async(req,res)=>{
    const resumes = await prisma.post.findMany({
        select:{
            resumeId: true,
            title: true,
            createdAt: true,
            updatedAt: true,
        },
        orderBy:{
            createdAt: 'desc' //내림차순 asc는 오름차순
        }
    });

    return res.status(200).json({data:resumes});
});

//이력서 상세조회
router.get('/resumes/:resumeId', async(req,res,next)=>{
    const {resumeId} =req.params;
    const resume = await prisma.resumes.findFirst({
        where: {resumeId: +resumeId},
        select: {
            resumeId: true,
            title: true,
            introduction: true,
            createdAt: true,
            updatedAt: true,

        }
    });

    return res.status(200).json({data:resume});
})

//이력서 수정
router.patch('/resume/:resumeId', accessMiddleware, async(req, res, next) => {
    try{
       const {resumeId} = req.params;
    const {title, introduction} = req.body;
    
    if(!title && !introduction)
        return res.status(400).json({message:'수정할 정보를 확인해주세요.'})
    

    const resume = await prisma.resumes.findFirst({
        where: {resumeId: +resumeId},
    });

    if(!resume) 
        return res.status(404).json({message:'존재하지 않는 이력서입니다.'})

    const updateResume = await prisma.resumes.update({
        where: {resumeId: +resumeId },
        data : {title, introduction}
    });

    const Resume = {
        resumeId: updateResume.resumeId,
        userId: updateResume.userId,
        title: updateResume.title,
        introduction: updateResume.introduction,
        createdAt: updateResume.createdAt,
        updatedAt: updateResume.updatedAt,
    };

    return res.status(200).json({Resume}); 
    } catch(error) {
        next(error);
    }   
});

//게시글 삭제
router.delete('/resume/:resumeId', accessMiddleware, async(req, res, next)=> {
    const {resumeId} = req.params;

    const resume = await prisma.resumes.findFirst({
        where: { resumeId: +resumeId}
    }) 
    if(!resume)
        return res.status(404).json({message:'존재하지 않는 이력서입니다.'})

    await prisma.resumes.delete({where:{resumeId: +resumeId}});
    
    return res.status(200).json({resumeId: +resumeId});
})

export default router;