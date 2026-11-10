#!/bin/bash
# 递归复制每个问题目录下所有子目录里的 jpg/png 图片到网站对应目录

SRC_ROOT="/Users/lishutong/SynologyDrive/【02】项目/【2026】课程推广/【01】嵌入式操作系统100问"
DST_ROOT="/Users/lishutong/Documents/site/docs/notes/tech/rtos100"

# 分组映射
get_group() {
  local num=$1
  local n=$((10#$num))
  if [ $n -ge 1 ] && [ $n -le 9 ]; then echo "base"
  elif [ $n -ge 10 ] && [ $n -le 31 ]; then echo "task"
  elif [ $n -eq 32 ] || [ $n -eq 33 ]; then echo "memory"
  elif [ $n -ge 34 ] && [ $n -le 43 ]; then echo "schedule"
  elif [ $n -eq 45 ] || [ $n -ge 46 ] && [ $n -le 53 ]; then echo "schedule"
  elif [ $n -ge 54 ] && [ $n -le 59 ]; then echo "timer"
  elif [ $n -ge 60 ] && [ $n -le 79 ]; then echo "ipc"
  elif [ $n -ge 80 ] && [ $n -le 84 ]; then echo "irq"
  elif [ $n -ge 85 ] && [ $n -le 90 ]; then echo "kernel"
  elif [ $n -eq 91 ]; then echo "irq"
  else echo ""
  fi
}

count=0
for dir in "$SRC_ROOT"/【*/; do
  dirname=$(basename "$dir")
  num=$(echo "$dirname" | grep -oE '【[0-9]+】' | tr -d '【】')
  if [ -z "$num" ]; then continue; fi
  
  group=$(get_group "$num")
  if [ -z "$group" ]; then continue; fi
  
  dst_images="$DST_ROOT/$group/images/q$num"
  mkdir -p "$dst_images"
  
  # 递归查找所有 jpg/png 文件，复制到目标目录（不保留子目录结构）
  find "$dir" -type f \( -name "*.jpg" -o -name "*.png" \) -exec cp {} "$dst_images/" \; 2>/dev/null
  
  # 统计复制了多少张
  img_count=$(ls "$dst_images/" | wc -l)
  count=$((count + 1))
  echo "q$num -> $group/ ($img_count imgs)"
done

echo ""
echo "=== 完成: 处理了 $count 个问题目录 ==="
