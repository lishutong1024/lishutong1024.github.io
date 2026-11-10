<template><div><blockquote>
<p>为了更好地使用RTOS，我们需要深入理解RTOS工作原理，最好的方法是动手写一个RTOS。</p>
<p>如果你希望写一个类似RT-Thread/FreeRTOS的系统，欢迎关注这门课程：<a href="https://zw8ls.xetlk.com/s/H2F1Y" target="_blank" rel="noopener noreferrer">【RTOS内核开发】从0手写嵌入式操作系统</a></p>
</blockquote>
<p><strong>本课程将通过大概100行代码、10节课时，一步步地演示如何从最简单的前后台代码，演化成一个多任务切换的微型OS。通过精心设计的少量代码，你将专注理解RTOS任务切换最核心地机制。</strong></p>
<h1 id="设计原因" tabindex="-1"><a class="header-anchor" href="#设计原因"><span>设计原因</span></a></h1>
<p>在嵌入式系统开发工作中，我们有时会遇到需求复杂，单纯的采用前后台系统实现较为困难的情况，此时就需要引入RTOS。借助RTOS，原本大的、复杂的任务可以分解成多个子任务，然后分别在RTOS创建相应的任务去处理。</p>
<p>目前市面上已经有很多成熟的RTOS，比如FreeRTOS、rt-thread等。一般情况下，我们只需使用就可以了。但是如果能够深入地了解RTOS的运行机制，那么将大大有助于掌握如何在实际开发中正确地使用RTOS。然后很多现有的资料都只是讲如何调用RTOS的API，而对内部细节介绍不多。</p>
<p>本课程的主要目标，<strong>我将带领你深入地去理解RTOS最核心的工作机制：任务是如何进行切换的</strong>。</p>
<h1 id="资料下载" tabindex="-1"><a class="header-anchor" href="#资料下载"><span>资料下载</span></a></h1>
<p><VPLink href="/other/osswitch/cortex_task_switch.zip">cortex_task_switch.zip</VPLink></p>
<p>课程所用的Keil开发软件，请自行从Keil官网下载。建议使用最新版本，使用低版本必须支持v6编译器，否则可能无法编译通过。</p>
<h1 id="学习基础要求" tabindex="-1"><a class="header-anchor" href="#学习基础要求"><span>学习基础要求</span></a></h1>
<p>以下技能要求已经熟练掌握，本课程中不会详细说明。</p>
<ul>
<li>Keil开发工具的下载、安装及基本使用</li>
<li>熟悉Cortex-M内核的体系结构，如栈的管理、基本指令集</li>
<li>RTOS的基本概念，如何使用RTOS的API进行任务的创建和切换</li>
<li>基础的C语言知识，了解如何汇编语言进行编程</li>
</ul>
<p>如果你不具备以上内容的相关知识储备，请访问我的课程网站，获取相关的课程学习链接。</p>
<p><a href="https://lishutong1024.github.io" target="_blank" rel="noopener noreferrer">李述铜的知识课堂</a></p>
<h1 id="答疑和支持" tabindex="-1"><a class="header-anchor" href="#答疑和支持"><span>答疑和支持</span></a></h1>
<p>本课程内容较简单，不太可能遇到大的问题。但如果确实遇到相关的疑问，也可以联系我，获得支持和答疑。</p>
<font style="color:#DF2A3F;">注意：课程中有关汇编语言的编程方法、函数调用机制等内容不属于本课程的内容，请自行学习上述推荐课程或查找资料。本课程不提供相关的答疑和支持。</font><h1 id="注意事项" tabindex="-1"><a class="header-anchor" href="#注意事项"><span>注意事项</span></a></h1>
<p>本系列文档作为视频内容的补充，无法完全替代视频内容，且有些视频中的内容可能未在文档中写入，请在观看视频的过程中结合该文档学习，而不是仅仅依赖该文档。</p>
</div></template>


