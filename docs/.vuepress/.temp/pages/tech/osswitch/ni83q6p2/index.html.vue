<template><div><blockquote>
<p>为了更好地使用RTOS，我们需要深入理解RTOS工作原理，最好的方法是动手写一个RTOS。</p>
<p>如果你希望写一个类似RT-Thread/FreeRTOS的系统，欢迎关注这门课程：<a href="https://zw8ls.xetlk.com/s/H2F1Y" target="_blank" rel="noopener noreferrer">【RTOS内核开发】从0手写嵌入式操作系统</a></p>
</blockquote>
<p>前一节课时已经用汇编代码实现了一个任务切换函数task_switch()，接下来，就可以在这个汇编函数继续做修改，逐步解决前面提到的两个问题：避免每次从任务函数开始处执行、栈溢出。</p>
<p>本小节主要解决第一个问题，即避免每次都从任务函数的开始处执行。</p>
<h1 id="实现原理" tabindex="-1"><a class="header-anchor" href="#实现原理"><span>实现原理</span></a></h1>
<p>在前面介绍函数调用与返回的机制内容时，我们已经了解到：在Cortex-M3上当调用一个函数时，函数的返回地址保存在LR寄存器里。</p>
<p>因此，如果我们希望task_0_entry()任务执行task_switch()切换到task_1_entry()，再由task_1_entry()调用task_switch()切换回来时，能够从task_0_entry()中调用task_switch()语句的下方继续执行；我们可以考虑将LR寄存器的值预先保存起来。</p>
<blockquote>
<p>也就是说，我们需要为task_0_entry和task_1_entry分别分配一个专门保存task_switch()返回地址的变量，如task0_return_addr和task1_return_addr。</p>
<p>在一个任务调用task_switch()时，将LR寄存器的值保存到该任务自己的task?_return_addr中。</p>
<p>当从另一个任务调用task_switch()切换回来时，就从task?_return_addr中取出该地址并跳转到该地址执行。</p>
</blockquote>
<p>通过上述流程，就解决了本小节关注的问题：避免每次调用task_switch()时都从任务函数的开始处执行。</p>
<h1 id="具体实现" tabindex="-1"><a class="header-anchor" href="#具体实现"><span>具体实现</span></a></h1>
<p>因此，针对task_0和task2分别定义了两个变量，用于保存这两个任务最后执行到了哪个位置。</p>
<div class="language-c line-numbers-mode" data-highlighter="shiki" data-ext="c" style="--shiki-light:#393a34;--shiki-dark:#dbd7caee;--shiki-light-bg:#ffffff;--shiki-dark-bg:#121212"><pre class="shiki shiki-themes vitesse-light vitesse-dark vp-code" v-pre=""><code class="language-c"><span class="line"><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">unsigned</span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676"> int</span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE"> task0_return_addr</span><span style="--shiki-light:#999999;--shiki-dark:#666666">;</span></span>
<span class="line"><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">unsigned</span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676"> int</span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE"> task1_return_addr</span><span style="--shiki-light:#999999;--shiki-dark:#666666">;</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div></div></div><p>当某个任务调用task_switch()函数时，可以将这个任务的return_addr传进去，将LR寄存器的值保存到该变量中。以task0为例，其调用如下：</p>
<div class="language-c line-numbers-mode" data-highlighter="shiki" data-ext="c" style="--shiki-light:#393a34;--shiki-dark:#dbd7caee;--shiki-light-bg:#ffffff;--shiki-dark-bg:#121212"><pre class="shiki shiki-themes vitesse-light vitesse-dark vp-code" v-pre=""><code class="language-c"><span class="line"><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">void</span><span style="--shiki-light:#59873A;--shiki-dark:#80A665"> task_0_entry</span><span style="--shiki-light:#999999;--shiki-dark:#666666"> (</span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">void</span><span style="--shiki-light:#999999;--shiki-dark:#666666">)</span><span style="--shiki-light:#999999;--shiki-dark:#666666"> {</span></span>
<span class="line"><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">    int</span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE"> count </span><span style="--shiki-light:#999999;--shiki-dark:#666666">=</span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676"> -</span><span style="--shiki-light:#2F798A;--shiki-dark:#4C9A91">1</span><span style="--shiki-light:#999999;--shiki-dark:#666666">;</span></span>
<span class="line"><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE">    </span></span>
<span class="line"><span style="--shiki-light:#1E754F;--shiki-dark:#4D9375">    for</span><span style="--shiki-light:#999999;--shiki-dark:#666666"> (;;)</span><span style="--shiki-light:#999999;--shiki-dark:#666666"> {</span></span>
<span class="line"><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE">        count</span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">++</span><span style="--shiki-light:#999999;--shiki-dark:#666666">;</span></span>
<span class="line"><span style="--shiki-light:#59873A;--shiki-dark:#80A665">        task_switch</span><span style="--shiki-light:#999999;--shiki-dark:#666666">(</span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">&#x26;</span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE">task0_return_addr</span><span style="--shiki-light:#999999;--shiki-dark:#666666">,</span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE"> task1_return_addr</span><span style="--shiki-light:#999999;--shiki-dark:#666666">);</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666">    }</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666">}</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>注意，task_switch的参数已经变为两个。第一个参数传入的参数当前任务的return_addr地址，在执行task_switch()时，会将LR的值保存到该地址中。第二个参数为需要运行的任务的运行地址，此时不再是task_1_entry，因为我们并不希望每次都从task_1_entry开始处执行，而是从它最后执行的位置继续往下执行。</p>
<p>根据arm的参数传递规则，&amp;task0_return_addr参数将会通过R0寄存器传递，task1_return_addr将会传递给R1寄存器。task_switch的具体实现如下：</p>
<div class="language-c line-numbers-mode" data-highlighter="shiki" data-ext="c" style="--shiki-light:#393a34;--shiki-dark:#dbd7caee;--shiki-light-bg:#ffffff;--shiki-dark-bg:#121212"><pre class="shiki shiki-themes vitesse-light vitesse-dark vp-code" v-pre=""><code class="language-c"><span class="line"><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE">task_switch:</span></span>
<span class="line"><span style="--shiki-light:#A0ADA0;--shiki-dark:#758575DD">    // save to from_addr</span></span>
<span class="line"><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE">    str lr</span><span style="--shiki-light:#999999;--shiki-dark:#666666">,</span><span style="--shiki-light:#999999;--shiki-dark:#666666"> [</span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE">r0</span><span style="--shiki-light:#999999;--shiki-dark:#666666">]</span></span>
<span class="line"><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE">    </span></span>
<span class="line"><span style="--shiki-light:#A0ADA0;--shiki-dark:#758575DD">    // jmp to addr</span></span>
<span class="line"><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE">    bx r1</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h1 id="这告诉了我们什么" tabindex="-1"><a class="header-anchor" href="#这告诉了我们什么"><span>这告诉了我们什么</span></a></h1>
<p>从以上实现可以看出，在RTOS中，每个任务都有相应的“运行状态”。在本节课程中，我们会发现，每个任务需要将自己最后执行的位置记录下来。这样当OS进行任务的切换时，如果某个任务得到了运行的机会，那么就可以可以取出这个位置，然后任务就能够继续往下执行。</p>
</div></template>


