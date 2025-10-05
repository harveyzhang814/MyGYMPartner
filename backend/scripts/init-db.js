const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// 基础动作数据
const basicExercises = [
  {
    name: '卧推',
    nameZh: '卧推',
    description: '经典的胸部训练动作',
    descriptionZh: '经典的胸部训练动作',
    instructions: [
      'Lie flat on a bench with your feet on the floor',
      'Grip the bar with hands slightly wider than shoulder width',
      'Lower the bar to your chest with control',
      'Press the bar back up to starting position'
    ],
    instructionsZh: [
      '平躺在长凳上，双脚着地',
      '双手握杠铃，略宽于肩宽',
      '控制重量缓慢下放到胸部',
      '推举杠铃回到起始位置'
    ],
    muscleGroups: ['chest', 'triceps', 'shoulders'],
    equipment: 'barbell',
    difficultyLevel: 'INTERMEDIATE',
    category: 'strength'
  },
  {
    name: '深蹲',
    nameZh: '深蹲',
    description: '腿部训练的王牌动作',
    descriptionZh: '腿部训练的王牌动作',
    instructions: [
      'Stand with feet shoulder-width apart',
      'Lower your body by bending at the hips and knees',
      'Keep your chest up and back straight',
      'Return to starting position by extending hips and knees'
    ],
    instructionsZh: [
      '双脚与肩同宽站立',
      '弯曲髋关节和膝关节下蹲',
      '保持胸部挺起，背部挺直',
      '伸展髋关节和膝关节回到起始位置'
    ],
    muscleGroups: ['legs', 'glutes', 'core'],
    equipment: 'barbell',
    difficultyLevel: 'INTERMEDIATE',
    category: 'strength'
  },
  {
    name: '硬拉',
    nameZh: '硬拉',
    description: '全身力量训练动作',
    descriptionZh: '全身力量训练动作',
    instructions: [
      'Stand with feet hip-width apart, bar over mid-foot',
      'Bend at hips and knees to grip the bar',
      'Keep chest up and back straight',
      'Lift the bar by extending hips and knees',
      'Lower the bar with control'
    ],
    instructionsZh: [
      '双脚与髋同宽站立，杠铃在足中部上方',
      '弯曲髋关节和膝关节握住杠铃',
      '保持胸部挺起，背部挺直',
      '伸展髋关节和膝关节举起杠铃',
      '控制重量缓慢下放'
    ],
    muscleGroups: ['back', 'legs', 'glutes', 'core'],
    equipment: 'barbell',
    difficultyLevel: 'ADVANCED',
    category: 'strength'
  },
  {
    name: '引体向上',
    nameZh: '引体向上',
    description: '背部训练经典动作',
    descriptionZh: '背部训练经典动作',
    instructions: [
      'Hang from a pull-up bar with hands shoulder-width apart',
      'Pull your body up until your chin clears the bar',
      'Lower your body with control',
      'Repeat for desired reps'
    ],
    instructionsZh: [
      '双手与肩同宽握住单杠悬垂',
      '拉起身体直到下巴超过单杠',
      '控制身体缓慢下降',
      '重复至目标次数'
    ],
    muscleGroups: ['back', 'biceps'],
    equipment: 'bodyweight',
    difficultyLevel: 'INTERMEDIATE',
    category: 'strength'
  },
  {
    name: '推举',
    nameZh: '推举',
    description: '肩部训练主要动作',
    descriptionZh: '肩部训练主要动作',
    instructions: [
      'Stand with feet shoulder-width apart',
      'Hold the bar at shoulder level',
      'Press the bar straight up overhead',
      'Lower the bar with control to starting position'
    ],
    instructionsZh: [
      '双脚与肩同宽站立',
      '将杠铃举至肩部水平',
      '将杠铃垂直向上推举过头',
      '控制重量缓慢下放至起始位置'
    ],
    muscleGroups: ['shoulders', 'triceps', 'core'],
    equipment: 'barbell',
    difficultyLevel: 'INTERMEDIATE',
    category: 'strength'
  }
];

async function initializeDatabase() {
  try {
    console.log('🔄 开始初始化数据库...');
    
    // 检查是否已有基础动作
    const existingExercises = await prisma.exercise.count({
      where: { isTemplate: true }
    });
    
    if (existingExercises === 0) {
      console.log('📝 插入基础动作数据...');
      
      for (const exercise of basicExercises) {
        await prisma.exercise.create({
          data: {
            ...exercise,
            isTemplate: true,
            isPublic: true
          }
        });
      }
      
      console.log(`✅ 成功插入 ${basicExercises.length} 个基础动作`);
    } else {
      console.log('ℹ️  基础动作已存在，跳过插入');
    }
    
    console.log('🎉 数据库初始化完成！');
    
  } catch (error) {
    console.error('❌ 数据库初始化失败:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  initializeDatabase()
    .then(() => {
      console.log('✅ 脚本执行完成');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ 脚本执行失败:', error);
      process.exit(1);
    });
}

module.exports = { initializeDatabase, basicExercises };
