<template><div><p>在我之前的文章《为什么RTOS中的延时不一定精确》中，解释了RTOS延时函数不能实现准确延时的原因，那你可能会问：</p>
<blockquote>
<p>如果要求延时更加精确，应该怎么办？</p>
</blockquote>
<p>接下来，我将介绍几种常见方法的实现思路，这些思路不依赖具体的硬件和RTOS。你可以根据自己所用的环境自行实现。</p>
<p>当然，如果你有其他更好的方法，欢迎评论区补充。</p>
<h2 id="软件忙等待" tabindex="-1"><a class="header-anchor" href="#软件忙等待"><span>软件忙等待</span></a></h2>
<p><strong>最直接、最简单的方法是：使用空循环进行延时。</strong></p>
<p>这种方法也是我们在裸机程序中最常用的方法。它的原理很简单：</p>
<blockquote>
<p>CPU执行循环指令本身需要时间，循环执行的次数越多，延时就越长。通过调整循环次数，可以实现不同长度的延时。</p>
</blockquote>
<p>下面给出了一段简单示例代码。</p>
<div class="language-c line-numbers-mode" data-highlighter="shiki" data-ext="c" style="--shiki-light:#393a34;--shiki-dark:#dbd7caee;--shiki-light-bg:#ffffff;--shiki-dark-bg:#121212"><pre class="shiki shiki-themes vitesse-light vitesse-dark vp-code" v-pre=""><code class="language-c"><span class="line"><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">void</span><span style="--shiki-light:#59873A;--shiki-dark:#80A665"> delay_loop</span><span style="--shiki-light:#999999;--shiki-dark:#666666">(</span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">uint32_t</span><span style="--shiki-light:#B07D48;--shiki-dark:#BD976A"> count</span><span style="--shiki-light:#999999;--shiki-dark:#666666">)</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666">{</span></span>
<span class="line"><span style="--shiki-light:#1E754F;--shiki-dark:#4D9375">    while</span><span style="--shiki-light:#999999;--shiki-dark:#666666"> (</span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE">count</span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">--</span><span style="--shiki-light:#999999;--shiki-dark:#666666">)</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666">    {</span></span>
<span class="line"><span style="--shiki-light:#59873A;--shiki-dark:#80A665">        __NOP</span><span style="--shiki-light:#999999;--shiki-dark:#666666">();</span><span style="--shiki-light:#A0ADA0;--shiki-dark:#758575DD"> // 空指令，防止编译器优化掉循环</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666">    }</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666">}</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>这种方法的<strong>优点是：实现非常简单、不需要任何外设支持、不依赖RTOS、可以实现极短暂的微秒级等待</strong>。</p>
<p>但是，它的缺点也很明显：</p>
<ul>
<li><strong>延时时间不准确</strong>：时间受到编译器优化等级、CPU主频、流水线、缓存等多种因素的影响，很难精确控制。</li>
<li><strong>可移植性差</strong>：在将代码移植至其他硬件平台时，需要重新校准循环次数。</li>
<li><strong>白白占用CPU</strong>：CPU一直在执行空循环，无法去做其他有意义的事情。</li>
</ul>
<h2 id="硬件定时器查询" tabindex="-1"><a class="header-anchor" href="#硬件定时器查询"><span>硬件定时器查询</span></a></h2>
<p>如果系统中有空闲的定时器或计数器，则可以使用定时器或计数器来计时。</p>
<p>这种方法的本质是：<strong>让硬件计数器独立计时，CPU不断查询计数器的值或到期标志，直到达到目标时间</strong>。
<img src="@source/notes/tech/rtos100/schedule/images/q53/硬件定时器查询延时流程图.jpg" alt="硬件定时器查询延时流程图"></p>
<p>在实际的MCU中，有很多种定时器和计数器可以用来实现这种方法，常见的有：</p>
<ul>
<li><strong>Cortex-M内核的SysTick定时器</strong>：很多RTOS会使用SysTick作为系统时钟节拍的来源，如果已经被RTOS占用了，就不能再随意使用。</li>
<li><strong>Cortex-M的DWT周期计数器</strong>：该计数器的计数频率等于CPU主频，可以实现非常高精度的计时。</li>
<li><strong>MCU的通用定时器</strong>：如STM32的TIM1等，通常可以配置成向上计数或向下计数，支持预分频，可以用来实现精确延时。</li>
</ul>
<p>我们可以读取这些自由运行计数器的计数值，根据计数差来判断等待时间是否达到目标。</p>
<div class="language-c line-numbers-mode" data-highlighter="shiki" data-ext="c" style="--shiki-light:#393a34;--shiki-dark:#dbd7caee;--shiki-light-bg:#ffffff;--shiki-dark-bg:#121212"><pre class="shiki shiki-themes vitesse-light vitesse-dark vp-code" v-pre=""><code class="language-c"><span class="line"><span style="--shiki-light:#A0ADA0;--shiki-dark:#758575DD">/* 平台相关函数：读取硬件自由运行计数器的值 */</span></span>
<span class="line"><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">void</span><span style="--shiki-light:#59873A;--shiki-dark:#80A665"> delay_us_counter</span><span style="--shiki-light:#999999;--shiki-dark:#666666">(</span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">uint32_t</span><span style="--shiki-light:#B07D48;--shiki-dark:#BD976A"> us</span><span style="--shiki-light:#999999;--shiki-dark:#666666">)</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666">{</span></span>
<span class="line"><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">    uint32_t</span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE"> start </span><span style="--shiki-light:#999999;--shiki-dark:#666666">=</span><span style="--shiki-light:#59873A;--shiki-dark:#80A665"> get_hw_counter</span><span style="--shiki-light:#999999;--shiki-dark:#666666">();</span></span>
<span class="line"><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">    uint32_t</span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE"> target </span><span style="--shiki-light:#999999;--shiki-dark:#666666">=</span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE"> us </span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">*</span><span style="--shiki-light:#999999;--shiki-dark:#666666"> (</span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE">counter_freq </span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">/</span><span style="--shiki-light:#2F798A;--shiki-dark:#4C9A91"> 1000000</span><span style="--shiki-light:#999999;--shiki-dark:#666666">);</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#1E754F;--shiki-dark:#4D9375">    while</span><span style="--shiki-light:#999999;--shiki-dark:#666666"> ((</span><span style="--shiki-light:#59873A;--shiki-dark:#80A665">get_hw_counter</span><span style="--shiki-light:#999999;--shiki-dark:#666666">()</span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676"> -</span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE"> start</span><span style="--shiki-light:#999999;--shiki-dark:#666666">)</span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676"> &#x3C;</span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE"> target</span><span style="--shiki-light:#999999;--shiki-dark:#666666">)</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666">    {</span></span>
<span class="line"><span style="--shiki-light:#A0ADA0;--shiki-dark:#758575DD">        /* 持续检查计数器 */</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666">    }</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666">}</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>也可以将计数值设置为一个初始值，<strong>程序中可以不断检查其计数到期（溢出）标志，来判断等待时间是否达到目标</strong>。</p>
<div class="language-c line-numbers-mode" data-highlighter="shiki" data-ext="c" style="--shiki-light:#393a34;--shiki-dark:#dbd7caee;--shiki-light-bg:#ffffff;--shiki-dark-bg:#121212"><pre class="shiki shiki-themes vitesse-light vitesse-dark vp-code" v-pre=""><code class="language-c"><span class="line"><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">void</span><span style="--shiki-light:#59873A;--shiki-dark:#80A665"> delay_us_timer_poll</span><span style="--shiki-light:#999999;--shiki-dark:#666666">(</span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">uint32_t</span><span style="--shiki-light:#B07D48;--shiki-dark:#BD976A"> us</span><span style="--shiki-light:#999999;--shiki-dark:#666666">)</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666">{</span></span>
<span class="line"><span style="--shiki-light:#A0ADA0;--shiki-dark:#758575DD">    /* 配置定时器的定时时间 */</span></span>
<span class="line"><span style="--shiki-light:#59873A;--shiki-dark:#80A665">    timer_config</span><span style="--shiki-light:#999999;--shiki-dark:#666666">(</span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE">us</span><span style="--shiki-light:#999999;--shiki-dark:#666666">);</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#A0ADA0;--shiki-dark:#758575DD">    /* 清除标志，启动定时器 */</span></span>
<span class="line"><span style="--shiki-light:#59873A;--shiki-dark:#80A665">    timer_clear_flag</span><span style="--shiki-light:#999999;--shiki-dark:#666666">();</span></span>
<span class="line"><span style="--shiki-light:#59873A;--shiki-dark:#80A665">    timer_start</span><span style="--shiki-light:#999999;--shiki-dark:#666666">();</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#A0ADA0;--shiki-dark:#758575DD">    /* 查询等待定时器到期 */</span></span>
<span class="line"><span style="--shiki-light:#1E754F;--shiki-dark:#4D9375">    while</span><span style="--shiki-light:#999999;--shiki-dark:#666666"> (</span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">!</span><span style="--shiki-light:#59873A;--shiki-dark:#80A665">timer_is_expired</span><span style="--shiki-light:#999999;--shiki-dark:#666666">())</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666">    {</span></span>
<span class="line"><span style="--shiki-light:#A0ADA0;--shiki-dark:#758575DD">        /* 等待定时器到期 */</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666">    }</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#A0ADA0;--shiki-dark:#758575DD">    /* 关闭定时器 */</span></span>
<span class="line"><span style="--shiki-light:#59873A;--shiki-dark:#80A665">    timer_stop</span><span style="--shiki-light:#999999;--shiki-dark:#666666">();</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666">}</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>对比软件忙等待，<strong>这种方式同样存在&quot;白白占用CPU&quot;的问题。当移植到其他平台时，如果没有这些计数器，延时函数需要重新实现</strong>。</p>
<h2 id="让硬件自动完成时序" tabindex="-1"><a class="header-anchor" href="#让硬件自动完成时序"><span>让硬件自动完成时序</span></a></h2>
<p>如果要求的是精确脉冲、通信波形或定时采样，通常还有一种更合适的方案：</p>
<blockquote>
<p><strong>直接配置硬件，让它按照预定时间自动执行操作</strong>。</p>
</blockquote>
<p>例如，很多MCU（如STM32）的定时器可以通过输出比较功能，在指定计数时刻改变输出引脚的状态，从而产生精确的脉冲。
<img src="@source/notes/tech/rtos100/schedule/images/q53/硬件自动生成精确波形流程图.jpg" alt="硬件自动生成精确波形流程图"></p>
<p>同样的，也可以设置当定时中断触发后，通过DMA自动访问指定的外设接口（比如I2C或ADC）以进行数据采集。这使得整个数据采集过程不需要CPU干预，不受其他因素的影响。</p>
<h2 id="如何保证忙等延时的准确性" tabindex="-1"><a class="header-anchor" href="#如何保证忙等延时的准确性"><span>如何保证忙等延时的准确性</span></a></h2>
<p>你可能会发现：前面介绍的几种方法，在祼机环境中也是可以正常使用的。</p>
<blockquote>
<p>那么，是否意味着可以完全无需作任何调整，就能将原来祼机中的代码迁到RTOS环境中？</p>
</blockquote>
<p>要注意的是，<strong>对于软件忙等待和硬件定时器查询这两种方式，在延时过程中可能会被其他中断或者任务切换打断，导致实际的延时时间比预期的要长</strong>。</p>
<p>例如，某个任务想延时10微秒，它可能会这样写：</p>
<div class="language-c line-numbers-mode" data-highlighter="shiki" data-ext="c" style="--shiki-light:#393a34;--shiki-dark:#dbd7caee;--shiki-light-bg:#ffffff;--shiki-dark-bg:#121212"><pre class="shiki shiki-themes vitesse-light vitesse-dark vp-code" v-pre=""><code class="language-c"><span class="line"><span style="--shiki-light:#A0ADA0;--shiki-dark:#758575DD">/* 忙等延时函数，前面已经介绍过 */</span></span>
<span class="line"><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">void</span><span style="--shiki-light:#59873A;--shiki-dark:#80A665"> delay_us_counter</span><span style="--shiki-light:#999999;--shiki-dark:#666666">(</span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">uint32_t</span><span style="--shiki-light:#B07D48;--shiki-dark:#BD976A"> us</span><span style="--shiki-light:#999999;--shiki-dark:#666666">);</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#A0ADA0;--shiki-dark:#758575DD">/* 任务函数 */</span></span>
<span class="line"><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">void</span><span style="--shiki-light:#59873A;--shiki-dark:#80A665"> sensor_task</span><span style="--shiki-light:#999999;--shiki-dark:#666666">(</span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">void</span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676"> *</span><span style="--shiki-light:#B07D48;--shiki-dark:#BD976A">parameter</span><span style="--shiki-light:#999999;--shiki-dark:#666666">)</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666">{</span></span>
<span class="line"><span style="--shiki-light:#1E754F;--shiki-dark:#4D9375">    while</span><span style="--shiki-light:#999999;--shiki-dark:#666666"> (</span><span style="--shiki-light:#2F798A;--shiki-dark:#4C9A91">1</span><span style="--shiki-light:#999999;--shiki-dark:#666666">)</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666">    {</span></span>
<span class="line"><span style="--shiki-light:#A0ADA0;--shiki-dark:#758575DD">        /* 读取传感器数据 */</span></span>
<span class="line"><span style="--shiki-light:#59873A;--shiki-dark:#80A665">        read_sensor</span><span style="--shiki-light:#999999;--shiki-dark:#666666">();</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#A0ADA0;--shiki-dark:#758575DD">        /* 延时10微秒，等待传感器转换完成 */</span></span>
<span class="line"><span style="--shiki-light:#59873A;--shiki-dark:#80A665">        delay_us_counter</span><span style="--shiki-light:#999999;--shiki-dark:#666666">(</span><span style="--shiki-light:#2F798A;--shiki-dark:#4C9A91">10</span><span style="--shiki-light:#999999;--shiki-dark:#666666">);</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#A0ADA0;--shiki-dark:#758575DD">        /* 继续处理 */</span></span>
<span class="line"><span style="--shiki-light:#59873A;--shiki-dark:#80A665">        process_data</span><span style="--shiki-light:#999999;--shiki-dark:#666666">();</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666">    }</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666">}</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>但是，在调用delay_us_counter(10)的过程中，可能会被其他中断或者任务切换打断，导致实际的延时时间超过10微秒。</p>
<p>因此，如果不希望被打断，可以在延时期间关闭中断，延时结束后再打开中断，以避免干扰：</p>
<div class="language-c line-numbers-mode" data-highlighter="shiki" data-ext="c" style="--shiki-light:#393a34;--shiki-dark:#dbd7caee;--shiki-light-bg:#ffffff;--shiki-dark-bg:#121212"><pre class="shiki shiki-themes vitesse-light vitesse-dark vp-code" v-pre=""><code class="language-c"><span class="line"><span style="--shiki-light:#A0ADA0;--shiki-dark:#758575DD">/* 带中断保护的忙等延时函数 */</span></span>
<span class="line"><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">void</span><span style="--shiki-light:#59873A;--shiki-dark:#80A665"> delay_us_with_irq_disable</span><span style="--shiki-light:#999999;--shiki-dark:#666666">(</span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">uint32_t</span><span style="--shiki-light:#B07D48;--shiki-dark:#BD976A"> us</span><span style="--shiki-light:#999999;--shiki-dark:#666666">)</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666">{</span></span>
<span class="line"><span style="--shiki-light:#A0ADA0;--shiki-dark:#758575DD">    /* 关闭中断，保存当前中断状态 */</span></span>
<span class="line"><span style="--shiki-light:#998418;--shiki-dark:#B8A965">    rt_base_t</span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE"> level </span><span style="--shiki-light:#999999;--shiki-dark:#666666">=</span><span style="--shiki-light:#59873A;--shiki-dark:#80A665"> rt_hw_interrupt_disable</span><span style="--shiki-light:#999999;--shiki-dark:#666666">();</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#A0ADA0;--shiki-dark:#758575DD">    /* 执行忙等延时 */</span></span>
<span class="line"><span style="--shiki-light:#59873A;--shiki-dark:#80A665">    delay_us_counter</span><span style="--shiki-light:#999999;--shiki-dark:#666666">(</span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE">us</span><span style="--shiki-light:#999999;--shiki-dark:#666666">);</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#A0ADA0;--shiki-dark:#758575DD">    /* 恢复中断状态 */</span></span>
<span class="line"><span style="--shiki-light:#59873A;--shiki-dark:#80A665">    rt_hw_interrupt_enable</span><span style="--shiki-light:#999999;--shiki-dark:#666666">(</span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE">level</span><span style="--shiki-light:#999999;--shiki-dark:#666666">);</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#A0ADA0;--shiki-dark:#758575DD">/* 任务函数 */</span></span>
<span class="line"><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">void</span><span style="--shiki-light:#59873A;--shiki-dark:#80A665"> sensor_task</span><span style="--shiki-light:#999999;--shiki-dark:#666666">(</span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">void</span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676"> *</span><span style="--shiki-light:#B07D48;--shiki-dark:#BD976A">parameter</span><span style="--shiki-light:#999999;--shiki-dark:#666666">)</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666">{</span></span>
<span class="line"><span style="--shiki-light:#1E754F;--shiki-dark:#4D9375">    while</span><span style="--shiki-light:#999999;--shiki-dark:#666666"> (</span><span style="--shiki-light:#2F798A;--shiki-dark:#4C9A91">1</span><span style="--shiki-light:#999999;--shiki-dark:#666666">)</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666">    {</span></span>
<span class="line"><span style="--shiki-light:#A0ADA0;--shiki-dark:#758575DD">        /* 读取传感器数据 */</span></span>
<span class="line"><span style="--shiki-light:#59873A;--shiki-dark:#80A665">        read_sensor</span><span style="--shiki-light:#999999;--shiki-dark:#666666">();</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#A0ADA0;--shiki-dark:#758575DD">        /* 延时10微秒，带中断保护，确保不被打断 */</span></span>
<span class="line"><span style="--shiki-light:#59873A;--shiki-dark:#80A665">        delay_us_with_irq_disable</span><span style="--shiki-light:#999999;--shiki-dark:#666666">(</span><span style="--shiki-light:#2F798A;--shiki-dark:#4C9A91">10</span><span style="--shiki-light:#999999;--shiki-dark:#666666">);</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#A0ADA0;--shiki-dark:#758575DD">        /* 继续处理 */</span></span>
<span class="line"><span style="--shiki-light:#59873A;--shiki-dark:#80A665">        process_data</span><span style="--shiki-light:#999999;--shiki-dark:#666666">();</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666">    }</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666">}</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>不过，关闭中断会影响系统的实时性。因此，这种方法只适合较短的延时（比如几微秒到几十微秒），不适合长时间使用。</strong></p>
<h2 id="总结" tabindex="-1"><a class="header-anchor" href="#总结"><span>总结</span></a></h2>
<p>简单来说，在RTOS中实现更精确的延时，<strong>常见思路可以归纳为三类：软件忙等待、硬件定时器查询，以及硬件自动完成时序</strong>。具体选择哪一种方法，需要考虑延时精度、CPU占用、任务调度、中断响应等多方面的因素。</p>
<hr>
<blockquote>
<p>如果你希望系统地学习RTOS底层原理，可以了解我的《RTOS开发与实战》课程。</p>
<p>课程不是简单地讲解FreeRTOS API的使用，而是带你从零开始编写一个RTOS内核，逐步实现任务管理、任务调度、上下文切换、同步与通信等核心机制，并通过一个远程温湿度监控设备项目，将操作系统原理应用到实际嵌入式开发中。</p>
<p>适合希望深入理解RTOS工作原理、提升嵌入式底层开发能力的同学。</p>
<p><VPLink href="/blog/diyrtos/">课程详情</VPLink></p>
</blockquote>
</div></template>


