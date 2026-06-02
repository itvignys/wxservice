#!/bin/zsh
# Flutter 一键安装脚本

set -e

echo "==> 清理旧的 Flutter 目录..."
rm -rf ~/flutter

echo "==> 克隆 Flutter 稳定版（约需 1-2 分钟）..."
git clone https://github.com/flutter/flutter.git -b stable --depth 1 ~/flutter

echo "==> 配置 PATH..."
if ! grep -q 'flutter/bin' ~/.zshrc; then
  echo 'export PATH="$HOME/flutter/bin:$PATH"' >> ~/.zshrc
  echo "已追加到 ~/.zshrc"
fi

echo "==> 生效配置..."
source ~/.zshrc

echo "==> 验证安装..."
flutter --version

echo "==> 运行 flutter doctor 检查环境..."
flutter doctor

echo "==> 安装完成！"
