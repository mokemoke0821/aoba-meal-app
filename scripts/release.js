#!/usr/bin/env node

/**
 * リリース自動化スクリプト
 * 
 * 使用方法:
 *   npm run release:patch  - パッチバージョンアップ (v2.1.0 → v2.1.1)
 *   npm run release:minor  - マイナーバージョンアップ (v2.1.0 → v2.2.0)
 *   npm run release:major  - メジャーバージョンアップ (v2.1.0 → v3.0.0)
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 色付きログ
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✖${colors.reset} ${msg}`),
  step: (msg) => console.log(`\n${colors.bright}${msg}${colors.reset}`),
};

// コマンド実行ヘルパー
const exec = (command, options = {}) => {
  try {
    return execSync(command, {
      encoding: 'utf8',
      stdio: options.silent ? 'pipe' : 'inherit',
      ...options,
    });
  } catch (error) {
    log.error(`コマンド実行エラー: ${command}`);
    if (options.throwError !== false) {
      throw error;
    }
    return null;
  }
};

// バージョン種別を取得
const getVersionType = () => {
  const arg = process.argv[2];
  if (['patch', 'minor', 'major'].includes(arg)) {
    return arg;
  }
  log.error('バージョン種別を指定してください: patch, minor, major');
  process.exit(1);
};

// package.json からバージョンを取得
const getCurrentVersion = () => {
  const packageJsonPath = path.join(__dirname, '..', 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  return packageJson.version;
};

// バージョンを計算
const calculateNewVersion = (currentVersion, versionType) => {
  const [major, minor, patch] = currentVersion.split('.').map(Number);
  
  switch (versionType) {
    case 'major':
      return `${major + 1}.0.0`;
    case 'minor':
      return `${major}.${minor + 1}.0`;
    case 'patch':
      return `${major}.${minor}.${patch + 1}`;
    default:
      throw new Error('無効なバージョン種別');
  }
};

// Gitの状態をチェック
const checkGitStatus = () => {
  log.step('📋 Step 1: Gitの状態をチェック中...');
  
  const status = exec('git status --porcelain', { silent: true });
  if (status && status.trim()) {
    log.warning('未コミットの変更があります:');
    console.log(status);
    
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    
    return new Promise((resolve) => {
      readline.question('続行しますか？ (y/N): ', (answer) => {
        readline.close();
        if (answer.toLowerCase() !== 'y') {
          log.error('リリースを中止しました');
          process.exit(1);
        }
        resolve();
      });
    });
  } else {
    log.success('Gitの状態: クリーン');
  }
};

// テストを実行
const runTests = () => {
  log.step('🧪 Step 2: テストを実行中...');
  exec('npm test -- --watchAll=false --passWithNoTests');
  log.success('テストが成功しました');
};

// Lintを実行
const runLint = () => {
  log.step('🔍 Step 3: Lintを実行中...');
  const result = exec('npm run lint', { throwError: false });
  if (result === null) {
    log.warning('Lintエラーが検出されました。修正してください。');
    process.exit(1);
  }
  log.success('Lintが成功しました');
};

// ビルドを実行
const runBuild = () => {
  log.step('🔨 Step 4: ビルドを実行中...');
  exec('npm run build');
  log.success('ビルドが成功しました');
};

// バージョンをアップデート
const updateVersion = (newVersion) => {
  log.step('📝 Step 5: バージョンを更新中...');
  exec(`npm version ${newVersion} --no-git-tag-version`);
  log.success(`バージョンを ${newVersion} に更新しました`);
  return newVersion;
};

// CHANGELOGを生成
const generateChangelog = (version) => {
  log.step('📄 Step 6: CHANGELOGを生成中...');
  
  const changelogPath = path.join(__dirname, '..', 'CHANGELOG.md');
  const date = new Date().toISOString().split('T')[0];
  
  let changelog = '';
  if (fs.existsSync(changelogPath)) {
    changelog = fs.readFileSync(changelogPath, 'utf8');
  } else {
    changelog = '# Changelog\n\n';
  }
  
  const newEntry = `## [${version}] - ${date}

### Added
- 新機能をここに記載

### Changed
- 変更内容をここに記載

### Fixed
- バグ修正をここに記載

${changelog.replace('# Changelog\n\n', '')}`;
  
  fs.writeFileSync(changelogPath, `# Changelog\n\n${newEntry}`);
  log.success('CHANGELOGを生成しました（手動で編集してください）');
};

// Gitコミットとタグ
const commitAndTag = (version) => {
  log.step('🏷️  Step 7: Gitコミットとタグを作成中...');
  
  exec('git add .');
  exec(`git commit -m "chore(release): v${version}"`);
  exec(`git tag v${version}`);
  
  log.success(`コミットとタグ v${version} を作成しました`);
};

// リモートにプッシュ
const pushToRemote = (version) => {
  log.step('🚀 Step 8: リモートにプッシュ中...');
  
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  
  return new Promise((resolve) => {
    readline.question(`v${version} をリモートにプッシュしますか？ (y/N): `, (answer) => {
      readline.close();
      if (answer.toLowerCase() === 'y') {
        exec('git push origin main');
        exec(`git push origin v${version}`);
        log.success('リモートにプッシュしました');
        log.info('GitHub Actionsが自動的にリリースを作成します');
      } else {
        log.warning('プッシュをスキップしました');
        log.info('手動でプッシュしてください:');
        console.log(`  git push origin main`);
        console.log(`  git push origin v${version}`);
      }
      resolve();
    });
  });
};

// メイン処理
const main = async () => {
  console.log(`
${colors.bright}╔═══════════════════════════════════════════════╗
║   🚀 あおば給食管理アプリ リリーススクリプト   ║
╚═══════════════════════════════════════════════╝${colors.reset}
  `);
  
  try {
    const versionType = getVersionType();
    const currentVersion = getCurrentVersion();
    const newVersion = calculateNewVersion(currentVersion, versionType);
    
    log.info(`現在のバージョン: ${colors.bright}v${currentVersion}${colors.reset}`);
    log.info(`新しいバージョン: ${colors.bright}v${newVersion}${colors.reset}`);
    log.info(`バージョン種別: ${colors.bright}${versionType}${colors.reset}`);
    console.log('');
    
    await checkGitStatus();
    runTests();
    runLint();
    runBuild();
    updateVersion(newVersion);
    generateChangelog(newVersion);
    commitAndTag(newVersion);
    await pushToRemote(newVersion);
    
    console.log(`
${colors.green}${colors.bright}╔═══════════════════════════════════════════════╗
║          ✅ リリースプロセス完了！            ║
╚═══════════════════════════════════════════════╝${colors.reset}

${colors.bright}次のステップ:${colors.reset}
1. CHANGELOGを編集（必要に応じて）
2. GitHub Releases ページで詳細を確認
3. ユーザーに新バージョンをアナウンス

${colors.bright}リリースURL:${colors.reset}
https://github.com/mokemoke0821/aoba-meal-app/releases/tag/v${newVersion}
    `);
    
  } catch (error) {
    log.error('リリースプロセスでエラーが発生しました');
    console.error(error);
    process.exit(1);
  }
};

main();


