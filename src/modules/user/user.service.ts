import { prisma } from "../../lib/prisma"


const dashboardKPIReports = async (userId:string)=>{

    await prisma.customerProfile.findUnique({
        where:{id:userId,userId}
    })
    const kpis = await prisma.$transaction(async (tx) =>{
        const totalResume = await tx.resume.count({
            where:{userId}
        })
        const totalAnalysis = await tx.analysis.count({
            where:{userId}
        });
        const totalTransactions = await tx.payment.count({
            where:{userId}
        });
        return {totalAnalysis,totalResume,totalTransactions}
    })
    return kpis

}


export const userServices = {dashboardKPIReports}