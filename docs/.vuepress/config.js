import { defineUserConfig } from 'vuepress'
import { viteBundler } from '@vuepress/bundler-vite'
import { plumeTheme } from 'vuepress-theme-plume'

export default defineUserConfig({
    lang: 'zh-CN',
    title: '李述铜的嵌入式课堂',
    description: '李述铜的嵌入式课堂，专注于嵌入式操作系统、RTOS、TCP/IP协议栈等底层技术讲解。从0手写操作系统内核，深入浅出理解计算机底层原理，涵盖任务管理、调度、内存管理、中断、IPC等核心机制，助你提升嵌入式开发能力。',
    head: [
      ['meta', { name: 'keywords', content: '嵌入式操作系统, RTOS, 手写操作系统, TCP/IP协议栈, 嵌入式开发, 内核原理, 任务调度, 内存管理' }],
      ['meta', { name: 'baidu-site-verification', content: 'codeva-y4YVaKcM8p' }],
      ['meta', { property: 'og:image', content: '/rtosv2.png' }],
      ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
      ['script', {}, `
var _hmt = _hmt || [];
(function() {
  var hm = document.createElement("script");
  hm.src = "https://hm.baidu.com/hm.js?0ec0df4a6adf20a6a93079b1a41f0816";
  var s = document.getElementsByTagName("script")[0]; 
  s.parentNode.insertBefore(hm, s);
})();
      `],
    ],

    plugins: [

/*
      ['@vuepress-reco/vuepress-plugin-bulletin-popover', {
        width: '800px', // 默认 260px
        title: '消息提示',
        body: [
          {
            type: 'title',
            content: '添加冴羽好友入前端交流群',
            style: 'text-aligin: center;'
          },
          {
            type: 'image',
            src: 'https://cdn.jsdelivr.net/gh/mqyqingfeng/picture/IMG_3516.JPG'
          }
        ],
        footer: [
          {
            type: 'button',
            text: '打赏',
            link: '/donate'
          } 
        ]
      }],*/
    ],

    theme: plumeTheme({
      appearance: {
        initialValue: 'light',  // 默认浅色模式（白色背景）
      },
      profile: {
        name: '李述铜',
        description: '知识笔记',
        avatar: '/avatar.png',
        circle: true, // 是否为圆形头像
      },
      markdown: {
        bilibili: true, 
      },

      logo: '/logo.png',      // logo
      footer: { copyright: 'Copyright © 2023-present lishutong' },
      hostname: 'https://lishutong1024.cn/',
      plugins: {
        // 启用pdf阅读
        markdownPower: {
          pdf: true,
          bilibili: true,
        },
      },

      bulletin: {
        layout: 'top-right',
        lifetime: 'session',       // 'session' | 'always' | 'once'
        border: true,
        id: "新课优惠",
        title: "新课上线！《从零手写RTOS》",
        contentType: "markdown",
        contentFile: "docs/notes/rtos_note.md",
      },

      collections: [
          { type: 'post', dir: 'blog', title: '博客' },

        {
          type: "doc",
          dir: '/notes/tech/osswitch/',
          linkPrefix: "/tech/osswitch/",
          sidebar: [
            {
              text: '课程简介',
              link: 'intro.md', 
            },
            {
              text: '视频内容',
              link: 'video.md', 
            },
            {
              text: '前后台系统与RTOS',
              link: 'background_rtos.md', 
            },
            {
              text: '函数调用后如何返回',
              link: 'funcret.md', 
            },
            {
              text: '从多层函数调用中返回',
              link: 'mulret.md', 
            },
            {
              text: '相互调用实现任务伪切换',
              link: 'mmcall.md', 
            },
            {
              text: '利用跳转指令实现切换',
              link: 'jmpswitch.md', 
            },
            {
              text: '保存返回地址实现任务切换',
              link: 'save_ret.md', 
            },
            {
              text: '让每个任务都有自己的栈',
              link: 'taskstack.md', 
            },
            {
              text: '加载内核寄存器的初始值',
              link: 'reginit.md', 
            },
            {
              text: '保存内存寄存器的当前值',
              link: 'saveregval.md', 
            },
            {
              text: '封装任务的task结构',
              link: 'interface.md', 
            },
            {
              text: '扩展更多功能',
              link: 'more.md', 
            },
          ]
        }, 
        {
          type: "doc",
          dir: '/notes/tech/fatfs/',
          linkPrefix: "/tech/fatfs/",
          sidebar: [
            {
              text: '资料下载',
              link: 'download.md', 
            },
            {
              text: 'FATFS入门指南',
              collapsed: true,
              icon: 'mdi:language-typescript', // 侧边栏图标
              items: [
                'use/intro.md', 
                {
                  text: '基本概念与原理',
                  collapsed: true,
                  items: [
                    'use/c1/fs.md',
                    'use/c1/fat.md',
                    'use/c1/fatfs.md',
                  ]         
                },
                {
                  text: '使用文件访问接口',
                  collapsed: true,
                  items: [
                    'use/c2/mount.md',
                    'use/c2/open.md',
                    'use/c2/read.md',
                    'use/c2/sync.md',
                    'use/c2/fgets.md',
                    'use/c2/fputs.md',
                    'use/c2/seek.md',
                    'use/c2/stat.md',
                    'use/c2/trunc.md',
                    'use/c2/alloc.md',
                    'use/c2/foword.md',
                  ]         
                },                 
                {
                  text: '目录与文件管理',
                  collapsed: true,
                  items: [
                    'use/c3/query.md',
                    'use/c3/list.md',
                    'use/c3/find.md',
                    'use/c3/chdir.md',
                    'use/c3/del.md',
                    'use/c3/create.md',
                    'use/c3/updateattr.md',
                    'use/c3/chvol.md',
                    
                  ]         
                },  
                {
                  text: '卷管理与系统配置',
                  collapsed: true,
                  items: [
                    'use/c4/free.md',
                    'use/c4/getlabel.md',
                  ]         
                },  
              ]
            },
            { 
              text: 'FATFS移植详解', 
              icon: 'mdi:language-typescript', // 侧边栏图标
              collapsed: true,
              items: [
                'port/intro.md', 
                {
                  text: '基本概念与原理',
                  collapsed: true,
                  items: [
                    'port/c1/whatsport.md',
                    'port/c1/files.md',
                  ]         
                },
                {
                  text: '移植详解',
                  collapsed: true,
                  items: [
                    'port/c2/visualstudio.md',
                    'port/c2/gdb32_w25q64.md',
                    'port/c2/gdb32_sdcard.md',
                    'port/c2/gdb32_rtos.md',
                  ]         
                },
              ] 
            },
            { 
              text: 'FATFS源码分析', 
              icon: 'mdi:language-typescript', // 侧边栏图标
              collapsed: true,
              items: [
                'code/intro.md', 
                'code/mount.md', 

              ] 
            },

          ]
        }, 
        {
          type: "doc",
          dir: '/notes/tech/rtthread/',
          linkPrefix: "/tech/rtthread/",
          sidebar: [
            {
              text: '使用指南',
              icon: 'mdi:language-typescript', // 侧边栏图标
              items: [
                {
                  text: '第1章 课程准备',
                  collapsed: true,
                  items: [
                    'use/c1/intro.md', 
                    'use/c1/download.md',
                    'use/c1/develop.md'
                  ]         
                },
                {
                  text: '第2章 为什么要用RTOS',
                  collapsed: true,
                  items: [
                    'use/c2/bare.md', 
                    'use/c2/tiaozhan.md',
                    'use/c2/whatrtos.md',
                    'use/c2/rtthread.md',
                    'use/c2/usertos.md',
                  ]                       
                },
                {
                  text: '第3章 RTOS是如何工作的',
                  collapsed: true,
                  items: [
                    'use/c3/什么是任务.md', 
                    'use/c3/RTOS是怎么管理任务的.md',
                    'use/c3/任务切换是怎么实现的.md',
                  ]                       
                },                  
                {
                  text: '第4章 怎么创建和启动任务？',
                  collapsed: true,
                  items: [
                    'use/c4/创建自己的第一个任务.md', 
                    'use/c4/临时性任务的创建.md',
                    'use/c4/静态创建任务.md',
                    'use/c4/怎样终止任务.md', 
                    'use/c4/怎样暂停任务的运行.md',
                    'use/c4/两个特殊的任务.md',
                  ]                       
                },   
                {
                  text: '第5章 任务哪个先执行？',
                  collapsed: true,
                  items: [
                    'use/c5/时间片调度.md', 
                    'use/c5/优先级调度.md',
                    'use/c5/主动让出CPU.md',
                    'use/c5/延时接口.md', 
                  ]                       
                },   
                {
                  text: '第6章 我能定时做一件事吗？',
                  collapsed: true,
                  items: [
                    'use/c6/为什么需要定时器.md', 
                    'use/c6/创建简单的定时器.md',
                    'use/c6/定时器底层机制揭秘.md',
                    'use/c6/定时器使用注意事项.md', 
                  ]                       
                },   
                {
                  text: '第7章 两个任务怎么配合工作？',
                  collapsed: true,
                  items: [
                    'use/c7/信号量——打个招呼再行动.md', 
                    'use/c7/互斥锁-禁止任务同时访问共享资源.md',
                    'use/c7/事件 - 同时等待多个标志位.md',
                  ]                       
                },   
                {
                  text: '第8章 如何在任务之间传递数据消息',
                  collapsed: true,
                  items: [
                    'use/c8/邮箱-向任务发送消息.md', 
                    'use/c8/消息队列-传递不定长的消息.md',
                  ]                       
                },   
                {
                  text: '第9章 怎样满足任务的内存需求',
                  collapsed: true,
                  items: [
                    'use/c9/给任务分配固定大小的内存块.md', 
                    'use/c9/按需分配内存块.md',
                  ]                       
                },   
              ]
            },
            {
              text: '移植详解',
              icon: 'mdi:language-typescript', // 侧边栏图标
              items: [
                'port/intro.md', 
              ]
            }
          ]
        },
        {
          type: "doc",
          dir: '/notes/tech/rtos100/',
          linkPrefix: "/tech/rtos100/",
          sidebar: [
            {
              text: '专栏介绍',
              link: 'intro.md',
            },
            {
              text: '一、基础概念',
              collapsed: true,
              items: [
                { text: '什么是嵌入式操作系统', link: 'base/q01.md' },
                { text: '你的项目真的需要RTOS吗', link: 'base/q02.md' },
                { text: 'RTOS中的实时到底是什么意思', link: 'base/q03.md' },
                { text: 'RTOS和裸机程序最大的区别是什么', link: 'base/q04.md' },
                { text: '裸机程序用状态机能代替RTOS吗', link: 'base/q05.md' },
                { text: '学习RTOS需要哪些前置知识', link: 'base/q06.md' },
                { text: '如何深入理解RTOS', link: 'base/q07.md' },
                { text: '为什么要学着手写一个RTOS', link: 'base/q08.md' },
                { text: '一个RTOS内核通常由哪些部分组成', link: 'base/q09.md' },
              ]
            },
            {
              text: '二、任务管理',
              collapsed: true,
              items: [
                { text: '什么是任务', link: 'task/q10.md' },
                { text: '任务函数和普通C函数有什么区别', link: 'task/q11.md' },
                { text: '任务必须是无限循环吗', link: 'task/q12.md' },
                { text: '任务从创建到运行会经历哪些状态', link: 'task/q13.md' },
                { text: '什么是任务控制块', link: 'task/q14.md' },
                { text: '任务优先级究竟控制什么', link: 'task/q15.md' },
                { text: '一个任务函数可以被多个任务共用吗', link: 'task/q16.md' },
                { text: '什么是任务安全函数', link: 'task/q17.md' },
                { text: '任务删除时需要注意什么', link: 'task/q18.md' },
                { text: '任务数量是不是越多越好', link: 'task/q19.md' },
                { text: '创建任务时内核需要做哪些事情', link: 'task/q20.md' },
                { text: '任务参数为什么不能传局部变量地址', link: 'task/q21.md' },
                { text: '静态创建和动态创建任务的区别', link: 'task/q22.md' },
                { text: '为什么RT-Thread把任务叫做线程', link: 'task/q23.md' },
                { text: '任务挂起与阻塞有什么区别', link: 'task/q24.md' },
                { text: '为什么每个任务都需要自己的栈', link: 'task/q25.md' },
                { text: '任务的栈应当设置成多大', link: 'task/q26.md' },
                { text: '可以动态修改任务栈大小吗', link: 'task/q27.md' },
                { text: '任务栈溢出后为什么程序会跑飞', link: 'task/q28.md' },
                { text: '为什么局部大数组容易导致栈溢出', link: 'task/q29.md' },
                { text: '创建任务时栈里放了什么', link: 'task/q30.md' },
                { text: '中断栈和任务栈为什么要分离', link: 'task/q31.md' },
              ]
            },
            {
              text: '三、内存管理',
              collapsed: true,
              items: [
                { text: '什么是内存池，和动态分配有什么区别', link: 'memory/q32.md' },
                { text: '为什么频繁申请释放内存会产生碎片', link: 'memory/q33.md' },
              ]
            },
            {
              text: '四、调度与上下文切换',
              collapsed: true,
              items: [
                { text: '什么情况下RTOS会立即切换任务', link: 'schedule/q34.md' },
                { text: '什么是抢占式调度', link: 'schedule/q35.md' },
                { text: '什么是时间片轮转调度', link: 'schedule/q36.md' },
                { text: '什么是优先级反转', link: 'schedule/q37.md' },
                { text: '优先级继承为什么能缓解优先级反转', link: 'schedule/q38.md' },
                { text: '两个任务互相等待会发生什么', link: 'schedule/q39.md' },
                { text: '任务被唤醒后为什么不一定立即运行', link: 'schedule/q40.md' },
                { text: '什么是优先级位图算法', link: 'schedule/q41.md' },
                { text: '什么是任务饿死，如何避免', link: 'schedule/q42.md' },
                { text: 'rt_thread_yield函数的工作原理', link: 'schedule/q43.md' },
                { text: '多个任务等同一个信号量谁先被唤醒', link: 'schedule/q45.md' },
                { text: '什么是上下文切换', link: 'schedule/q46.md' },
                { text: '一个任务的上下文包含哪些内容', link: 'schedule/q47.md' },
                { text: 'Cortex-M如何配合完成任务切换', link: 'schedule/q48.md' },
                { text: '单核CPU为什么能让任务同时运行', link: 'schedule/q49.md' },
                { text: '系统节拍设为1000ms会发生什么', link: 'schedule/q50.md' },
                { text: '任务延时时CPU在干什么', link: 'schedule/q51.md' },
                { text: '为什么RTOS中的延时不一定精确', link: 'schedule/q52.md' },
                { text: '如何实现更精确的延时', link: 'schedule/q53.md' },
              ]
            },
            {
              text: '五、定时器与时间管理',
              collapsed: true,
              items: [
                { text: '软件定时器和硬件定时器的区别', link: 'timer/q54.md' },
                { text: '定时器回调里能调用延时函数吗', link: 'timer/q55.md' },
                { text: '如何实现任务的周期性执行', link: 'timer/q56.md' },
                { text: '一个硬件定时器如何实现多个软件定时器', link: 'timer/q57.md' },
                { text: '任务等待超时是怎么实现的', link: 'timer/q58.md' },
                { text: '什么是看门狗，如何正确使用', link: 'timer/q59.md' },
              ]
            },
            {
              text: '六、同步与通信',
              collapsed: true,
              items: [
                { text: '什么是信号量', link: 'ipc/q60.md' },
                { text: '什么是二值信号量', link: 'ipc/q61.md' },
                { text: '什么是互斥锁', link: 'ipc/q62.md' },
                { text: '互斥锁和二值信号量的区别', link: 'ipc/q63.md' },
                { text: '什么是消息队列', link: 'ipc/q64.md' },
                { text: '什么是事件标志组', link: 'ipc/q65.md' },
                { text: '事件标志组和信号量的区别', link: 'ipc/q66.md' },
                { text: '多任务访问串口/全局变量如何保护', link: 'ipc/q67.md' },
                { text: '生产数据和处理数据的任务如何通信', link: 'ipc/q68.md' },
                { text: '任务间传递大块消息怎么完成', link: 'ipc/q69.md' },
                { text: '多个任务如何共享同一份数据', link: 'ipc/q70.md' },
                { text: '计数信号量如何管理多个资源', link: 'ipc/q71.md' },
                { text: '如何避免生产者速度超过消费者', link: 'ipc/q72.md' },
                { text: '如何实现任务间的双向通信', link: 'ipc/q73.md' },
                { text: '如何实现一个任务向多个任务广播', link: 'ipc/q74.md' },
                { text: '什么是消息队列的紧急消息', link: 'ipc/q75.md' },
                { text: '邮箱可以传递哪些类型的数据', link: 'ipc/q76.md' },
                { text: '邮箱和消息队列什么时候用哪个', link: 'ipc/q77.md' },
                { text: '如何实现请求响应模式的通信', link: 'ipc/q78.md' },
                { text: '怎样把ISR中的事交给任务完成', link: 'ipc/q79.md' },
              ]
            },
            {
              text: '七、中断与临界区',
              collapsed: true,
              items: [
                { text: '为什么中断里不能调用阻塞接口', link: 'irq/q80.md' },
                { text: '中断唤醒高优先级任务为何不立即执行', link: 'irq/q81.md' },
                { text: '什么是临界区', link: 'irq/q82.md' },
                { text: '临界区的嵌套使用', link: 'irq/q83.md' },
                { text: '什么是原子指令，有哪些原子操作', link: 'irq/q84.md' },
                { text: '关中断、调度锁和互斥锁的适用场景', link: 'irq/q91.md' },
              ]
            },
            {
              text: '八、内核机制与移植',
              collapsed: true,
              items: [
                { text: 'RTOS中的链表用在哪些地方', link: 'kernel/q85.md' },
                { text: 'RTOS内部有哪些队列，如何管理任务', link: 'kernel/q86.md' },
                { text: '为什么大多数RTOS不用系统调用指令', link: 'kernel/q87.md' },
                { text: '空闲任务是做什么的', link: 'kernel/q88.md' },
                { text: '移植RTOS到不同MCU要改哪些代码', link: 'kernel/q89.md' },
                { text: 'RTOS的钩子函数Hook是干什么的', link: 'kernel/q90.md' },
              ]
            },
          ]
        },
      ],

      // 左侧导航
      notes: {
        dir: '/notes/', // 声明所有笔记的目录
        link: '/', // 声明所有笔记默认的链接前缀， 默认为 '/'
        notes: [
          {
            dir: 'courses',
            link: '/courses/',
            sidebar: [
              {
                text: '计算机核心基础',
                icon: 'mdi:language-typescript', // 侧边栏图标
                items: [
                  'core/diylinux', 
                  'core/diytcpip',
                  'core/diyfat32', 
                  'core/tcp_web', 
                ]
              },
              { 
                text: '嵌入式', 
                icon: 'mdi:language-typescript', // 侧边栏图标
                items: [
                  'emebed/riscv',
                  'emebed/arm', 
                  'emebed/fatfs', 
                  'emebed/rtos', 
                  'emebed/rtos_old',
                  'emebed/8051'
                ]
              },
              {
                text: '网络协议',
                icon: 'mdi:language-typescript', // 侧边栏图标
                items: [
                  'network/http', 
                  'network/tftp',
                ]
              }

            ]
          },     
          {
            dir: 'tech/rtthread/',
            link: '/tech/rtthread/',
            sidebar: [
              {
                text: '使用指南',
                icon: 'mdi:language-typescript', // 侧边栏图标
                items: [
                  {
                    text: '第1章 课程准备',
                    collapsed: true,
                    items: [
                      'use/c1/intro.md', 
                      'use/c1/download.md',
                      'use/c1/develop.md'
                    ]         
                  },
                  {
                    text: '第2章 为什么要用RTOS',
                    collapsed: true,
                    items: [
                      'use/c2/bare.md', 
                      'use/c2/tiaozhan.md',
                      'use/c2/whatrtos.md',
                      'use/c2/rtthread.md',
                      'use/c2/usertos.md',
                    ]                       
                  },
                  {
                    text: '第3章 RTOS是如何工作的',
                    collapsed: true,
                    items: [
                      'use/c3/什么是任务.md', 
                      'use/c3/RTOS是怎么管理任务的.md',
                      'use/c3/任务切换是怎么实现的.md',
                    ]                       
                  },                  
                  {
                    text: '第4章 怎么创建和启动任务？',
                    collapsed: true,
                    items: [
                      'use/c4/创建自己的第一个任务.md', 
                      'use/c4/临时性任务的创建.md',
                      'use/c4/静态创建任务.md',
                      'use/c4/怎样终止任务.md', 
                      'use/c4/怎样暂停任务的运行.md',
                      'use/c4/两个特殊的任务.md',
                    ]                       
                  },   
                  {
                    text: '第5章 任务哪个先执行？',
                    collapsed: true,
                    items: [
                      'use/c5/时间片调度.md', 
                      'use/c5/优先级调度.md',
                      'use/c5/主动让出CPU.md',
                      'use/c5/延时接口.md', 
                    ]                       
                  },   
                  {
                    text: '第6章 我能定时做一件事吗？',
                    collapsed: true,
                    items: [
                      'use/c6/为什么需要定时器.md', 
                      'use/c6/创建简单的定时器.md',
                      'use/c6/定时器底层机制揭秘.md',
                      'use/c6/定时器使用注意事项.md', 
                    ]                       
                  },   
                  {
                    text: '第7章 两个任务怎么配合工作？',
                    collapsed: true,
                    items: [
                      'use/c7/信号量——打个招呼再行动.md', 
                      'use/c7/互斥锁-禁止任务同时访问共享资源.md',
                      'use/c7/事件 - 同时等待多个标志位.md',
                    ]                       
                  },   
                  {
                    text: '第8章 如何在任务之间传递数据消息',
                    collapsed: true,
                    items: [
                      'use/c8/邮箱-向任务发送消息.md', 
                      'use/c8/消息队列-传递不定长的消息.md',
                    ]                       
                  },   
                  {
                    text: '第9章 怎样满足任务的内存需求',
                    collapsed: true,
                    items: [
                      'use/c9/给任务分配固定大小的内存块.md', 
                      'use/c9/按需分配内存块.md',
                    ]                       
                  },   
                ]
              },
              {
                text: '移植详解',
                icon: 'mdi:language-typescript', // 侧边栏图标
                items: [
                  'port/intro.md', 
                ]
              }
            ]
          }, 
 
        ]
      },
  
      // 导航条
      navbar: [
        { text: '首页', link: '/', icon: 'material-symbols:home-outline' },
        //{ 
        //  text: '课程介绍', 
        //  icon: 'material-symbols:home-outline',
        //  prefix: "/notes/courses/",
        //  link: '/notes/courses/list',
        //},
        {
          text: '课程资料',
          icon: 'material-symbols:home-outline',
          prefix: '/notes/',
          link: '/notes/note/doc.md',
      
        },  
        {
          text: '推荐课程',
          icon: 'material-symbols:home-outline',
          prefix: '/notes/',
          items:[
            {
              text: '从0手写x86操作系统',
              link: '/notes/courses/core/diylinux.md',
            },
            {
              text: '从0手写TCP/IP协议栈',
              link: '/notes/courses/core/diytcpip.md',
            },
            {
              text: '从0手写嵌入式操作系统',
              link: '/blog/os/newrto_intr.md',
            },
          ],
        },
         
        {
          text: '技术专栏',
          icon: 'material-symbols:home-outline',
          prefix: '/notes/',
          items:[
            {
              text: '嵌入式操作系统100问',
              link: '/notes/tech/rtos100/intro.md',
            }
          ]
        }, 
         {
          text: '博客文章',
          icon: 'material-symbols:home-outline',
          link: '/blog/',

        },

        {
          text: '学习入口',
          link: 'https://app7ulykyut1996.pc.xiaoe-tech.com/', 
          icon: 'material-symbols:article-outline' }, 
      ]
  }),
  bundler: viteBundler(),
})