#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// package.jsonを読み込み
const packageJsonPath = path.join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// 期待されるhomepage値
const EXPECTED_HOMEPAGE = 'https://mokemoke0821.github.io/aoba-meal-app';

// チェック
if (packageJson.homepage !== EXPECTED_HOMEPAGE) {
    console.error('\n❌ ERROR: package.json の homepage が正しくありません\n');
    console.error(`   現在の値: "${packageJson.homepage}"`);
    console.error(`   期待する値: "${EXPECTED_HOMEPAGE}"\n`);
    console.error('   デプロイ前に package.json の homepage を修正してください。\n');
    process.exit(1);
}

console.log('✅ homepage設定チェック: OK');

