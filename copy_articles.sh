#!/bin/bash
# 批量复制RTOS100问文章到网站目录

SRC="/Users/lishutong/SynologyDrive/【02】项目/【2026】课程推广/【01】嵌入式操作系统100问"
DST="/Users/lishutong/Documents/site/docs/notes/tech/rtos100"

# 根据问题编号返回分组目录
get_group() {
  local num=$1
  # 去掉前导0
  local n=$((10#$num))
  
  if [ $n -ge 1 ] && [ $n -le 9 ]; then
    echo "base"
  elif [ $n -ge 10 ] && [ $n -le 31 ]; then
    echo "task"
  elif [ $n -eq 32 ] || [ $n -eq 33 ]; then
    echo "memory"
  elif [ $n -ge 34 ] && [ $n -le 43 ]; then
    echo "schedule"
  elif [ $n -eq 45 ] || [ $n -ge 46 ] && [ $n -le 53 ]; then
    echo "schedule"
  elif [ $n -ge 54 ] && [ $n -le 59 ]; then
    echo "timer"
  elif [ $n -ge 60 ] && [ $n -le 79 ]; then
    echo "ipc"
  elif [ $n -ge 80 ] && [ $n -le 84 ]; then
    echo "irq"
  elif [ $n -ge 85 ] && [ $n -le 90 ]; then
    echo "kernel"
  elif [ $n -eq 91 ]; then
    echo "irq"
  else
    echo ""
  fi
}

count=0
for dir in "$SRC"/【*/; do
  dirname=$(basename "$dir")
  # 提取编号（【01】xxx -> 01）
  num=$(echo "$dirname" | grep -oE '【[0-9]+】' | tr -d '【】')
  
  if [ -z "$num" ]; then
    continue
  fi
  
  group=$(get_group "$num")
  if [ -z "$group" ]; then
    echo "SKIP: $dirname (未分组)"
    continue
  fi
  
  # 源文件
  src_article="$dir/技术文章.md"
  if [ ! -f "$src_article" ]; then
    echo "MISSING: $src_article"
    continue
  fi
  
  # 目标目录
  dst_dir="$DST/$group"
  dst_images="$dst_dir/images/q$num"
  mkdir -p "$dst_images"
  
  # 复制文章
  dst_article="$dst_dir/q$num.md"
  cp "$src_article" "$dst_article"
  
  # 复制所有jpg图片
  jpg_count=0
  for jpg in "$dir"/*.jpg; do
    if [ -f "$jpg" ]; then
      cp "$jpg" "$dst_images/"
      jpg_count=$((jpg_count + 1))
    fi
  done
  
  count=$((count + 1))
  echo "OK: q$num -> $group/ ($jpg_count imgs)"
done

echo ""
echo "=== 完成: 共复制 $count 篇文章 ==="
