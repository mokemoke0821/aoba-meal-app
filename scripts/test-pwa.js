#!/usr/bin/env node
/**
 * PWA設定検証スクリプト
 * 
 * このスクリプトは、PWA実装が正しく設定されているかを自動的に検証します。
 * 
 * 実行方法: npm run test:pwa
 * 
 * 検証項目:
 * - manifest.json の存在と妥当性
 * - Service Worker の存在と構文チェック
 * - アイコンファイルの存在
 * - パス整合性テスト
 */

const fs = require('fs');
const path = require('path');

// カラー出力用のANSIエスケープコード
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
};

// ログ出力関数
const log = {
    success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
    error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
    warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
    info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
    section: (msg) => console.log(`\n${colors.cyan}${'='.repeat(60)}\n${msg}\n${'='.repeat(60)}${colors.reset}\n`),
};

// 検証結果を格納
const results = {
    passed: 0,
    failed: 0,
    warnings: 0,
    errors: [],
};

// プロジェクトルート
const projectRoot = path.resolve(__dirname, '..');

// ファイルパス
const paths = {
    publicManifest: path.join(projectRoot, 'public', 'manifest.json'),
    buildManifest: path.join(projectRoot, 'build', 'manifest.json'),
    buildServiceWorker: path.join(projectRoot, 'build', 'service-worker.js'),
    buildIndex: path.join(projectRoot, 'build', 'index.html'),
    icon192: path.join(projectRoot, 'public', 'icons', 'icon-192x192.png'),
    icon512: path.join(projectRoot, 'public', 'icons', 'icon-512x512.png'),
    packageJson: path.join(projectRoot, 'package.json'),
    cracoConfig: path.join(projectRoot, 'craco.config.js'),
};

/**
 * ファイル存在確認
 */
function checkFileExists(filePath, description) {
    if (fs.existsSync(filePath)) {
        log.success(`${description}: 存在確認`);
        results.passed++;
        return true;
    } else {
        log.error(`${description}: ファイルが見つかりません - ${filePath}`);
        results.failed++;
        results.errors.push(`${description}が見つかりません`);
        return false;
    }
}

/**
 * JSON妥当性チェック
 */
function validateJson(filePath, description) {
    try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const json = JSON.parse(content);
        log.success(`${description}: JSON構文正常`);
        results.passed++;
        return json;
    } catch (error) {
        log.error(`${description}: JSON構文エラー - ${error.message}`);
        results.failed++;
        results.errors.push(`${description}のJSON構文エラー`);
        return null;
    }
}

/**
 * manifest.json 必須フィールド確認
 */
function validateManifestFields(manifest, source) {
    log.info(`manifest.json (${source}) の必須フィールドを確認中...`);

    const requiredFields = {
        name: 'string',
        short_name: 'string',
        start_url: 'string',
        display: 'string',
        icons: 'array',
    };

    let allFieldsValid = true;

    for (const [field, expectedType] of Object.entries(requiredFields)) {
        if (manifest[field]) {
            const actualType = Array.isArray(manifest[field]) ? 'array' : typeof manifest[field];
            if (actualType === expectedType) {
                log.success(`  - ${field}: ${actualType}型で存在`);
                results.passed++;
            } else {
                log.error(`  - ${field}: 型が不正（期待: ${expectedType}、実際: ${actualType}）`);
                results.failed++;
                results.errors.push(`manifest.json の ${field} の型が不正`);
                allFieldsValid = false;
            }
        } else {
            log.error(`  - ${field}: フィールドが存在しません`);
            results.failed++;
            results.errors.push(`manifest.json に ${field} フィールドがありません`);
            allFieldsValid = false;
        }
    }

    // 推奨フィールドの確認
    const recommendedFields = ['id', 'scope', 'theme_color', 'background_color'];
    for (const field of recommendedFields) {
        if (manifest[field]) {
            log.success(`  - ${field}: 存在（推奨）`);
            results.passed++;
        } else {
            log.warning(`  - ${field}: フィールドがありません（推奨項目）`);
            results.warnings++;
        }
    }

    return allFieldsValid;
}

/**
 * manifest.json アイコン確認
 */
function validateManifestIcons(manifest) {
    log.info('manifest.json のアイコン設定を確認中...');

    if (!manifest.icons || !Array.isArray(manifest.icons)) {
        log.error('  - icons配列が存在しません');
        results.failed++;
        results.errors.push('manifest.json に icons配列がありません');
        return false;
    }

    const requiredSizes = ['192x192', '512x512'];
    const requiredPurposes = ['any', 'maskable'];
    let allIconsValid = true;

    for (const size of requiredSizes) {
        for (const purpose of requiredPurposes) {
            const icon = manifest.icons.find(
                (i) => i.sizes === size && i.purpose === purpose
            );
            if (icon) {
                log.success(`  - ${size} (${purpose}): 存在`);
                results.passed++;
            } else {
                log.error(`  - ${size} (${purpose}): アイコン定義が見つかりません`);
                results.failed++;
                results.errors.push(`${size} (${purpose}) アイコンが manifest.json にありません`);
                allIconsValid = false;
            }
        }
    }

    return allIconsValid;
}

/**
 * Service Worker 構文チェック
 */
function validateServiceWorker(filePath) {
    log.info('Service Worker の構文を確認中...');

    try {
        const content = fs.readFileSync(filePath, 'utf-8');

        // 空ファイルチェック
        if (content.trim().length === 0) {
            log.error('  - Service Worker が空です');
            results.failed++;
            results.errors.push('Service Worker ファイルが空');
            return false;
        }

        // Workboxの存在確認
        if (content.includes('workbox')) {
            log.success('  - Workbox コードが含まれています');
            results.passed++;
        } else {
            log.warning('  - Workbox コードが見つかりません（カスタムSW？）');
            results.warnings++;
        }

        // skipWaiting / clientsClaim の確認
        if (content.includes('skipWaiting')) {
            log.success('  - skipWaiting が含まれています');
            results.passed++;
        } else {
            log.warning('  - skipWaiting が見つかりません');
            results.warnings++;
        }

        if (content.includes('clientsClaim')) {
            log.success('  - clientsClaim が含まれています');
            results.passed++;
        } else {
            log.warning('  - clientsClaim が見つかりません');
            results.warnings++;
        }

        // ファイルサイズチェック
        const sizeKB = (content.length / 1024).toFixed(2);
        if (sizeKB < 100) {
            log.success(`  - ファイルサイズ: ${sizeKB}KB（適切）`);
            results.passed++;
        } else {
            log.warning(`  - ファイルサイズ: ${sizeKB}KB（大きい可能性）`);
            results.warnings++;
        }

        return true;
    } catch (error) {
        log.error(`  - Service Worker 読み込みエラー: ${error.message}`);
        results.failed++;
        results.errors.push('Service Worker の読み込みに失敗');
        return false;
    }
}

/**
 * package.json 確認
 */
function validatePackageJson() {
    log.info('package.json を確認中...');

    if (!fs.existsSync(paths.packageJson)) {
        log.error('  - package.json が見つかりません');
        results.failed++;
        results.errors.push('package.json が見つかりません');
        return false;
    }

    const pkg = validateJson(paths.packageJson, 'package.json');
    if (!pkg) return false;

    // homepage フィールド確認
    if (pkg.homepage) {
        log.success(`  - homepage: ${pkg.homepage}`);
        results.passed++;

        // GitHub Pages サブパス確認
        if (pkg.homepage.includes('/aoba-meal-app')) {
            log.success('  - サブパス（/aoba-meal-app）が含まれています');
            results.passed++;
        } else {
            log.warning('  - サブパスが含まれていません（ルート配置の場合は問題なし）');
            results.warnings++;
        }
    } else {
        log.warning('  - homepage フィールドがありません');
        results.warnings++;
    }

    // workbox-webpack-plugin の確認
    if (pkg.dependencies && pkg.dependencies['workbox-webpack-plugin']) {
        log.success(`  - workbox-webpack-plugin: ${pkg.dependencies['workbox-webpack-plugin']}`);
        results.passed++;
    } else if (pkg.devDependencies && pkg.devDependencies['workbox-webpack-plugin']) {
        log.success(`  - workbox-webpack-plugin (devDep): ${pkg.devDependencies['workbox-webpack-plugin']}`);
        results.passed++;
    } else {
        log.error('  - workbox-webpack-plugin がインストールされていません');
        results.failed++;
        results.errors.push('workbox-webpack-plugin が見つかりません');
    }

    return true;
}

/**
 * アイコンファイルのサイズ確認
 */
function validateIconSize(filePath, expectedWidth, expectedHeight) {
    // ファイル存在確認のみ（画像サイズの検証にはライブラリが必要）
    if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        const sizeKB = (stats.size / 1024).toFixed(2);
        log.success(`  - ${path.basename(filePath)}: ${sizeKB}KB`);
        results.passed++;
        return true;
    } else {
        log.error(`  - ${path.basename(filePath)}: ファイルが見つかりません`);
        results.failed++;
        results.errors.push(`${path.basename(filePath)} が見つかりません`);
        return false;
    }
}

/**
 * パス整合性チェック
 */
function validatePathConsistency() {
    log.info('パス整合性を確認中...');

    // package.json の homepage
    const pkg = JSON.parse(fs.readFileSync(paths.packageJson, 'utf-8'));
    const homepage = pkg.homepage || '';

    // manifest.json の start_url と scope
    let manifestStartUrl = '';
    let manifestScope = '';
    if (fs.existsSync(paths.buildManifest)) {
        const manifest = JSON.parse(fs.readFileSync(paths.buildManifest, 'utf-8'));
        manifestStartUrl = manifest.start_url || '';
        manifestScope = manifest.scope || '';
    }

    // サブパス抽出
    const homepageSubpath = homepage.split('/').slice(-1)[0] || '';
    const startUrlSubpath = manifestStartUrl.replace(/^\//, '').replace(/\/$/, '');
    const scopeSubpath = manifestScope.replace(/^\//, '').replace(/\/$/, '');

    log.info(`  - package.json homepage: ${homepage}`);
    log.info(`  - manifest.json start_url: ${manifestStartUrl}`);
    log.info(`  - manifest.json scope: ${manifestScope}`);

    if (homepageSubpath === startUrlSubpath && homepageSubpath === scopeSubpath) {
        log.success('  - パス整合性: 正常（すべて一致）');
        results.passed++;
        return true;
    } else {
        log.warning('  - パス整合性: 不一致の可能性（手動確認推奨）');
        results.warnings++;
        return false;
    }
}

/**
 * メイン実行関数
 */
async function main() {
    console.log(`${colors.cyan}
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║       🚀 PWA設定検証スクリプト - あおば給食アプリ        ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
${colors.reset}`);

    // ========================================
    // 1. ファイル存在確認
    // ========================================
    log.section('📁 ファイル存在確認');

    checkFileExists(paths.publicManifest, 'public/manifest.json');
    checkFileExists(paths.icon192, 'public/icons/icon-192x192.png');
    checkFileExists(paths.icon512, 'public/icons/icon-512x512.png');
    checkFileExists(paths.packageJson, 'package.json');
    checkFileExists(paths.cracoConfig, 'craco.config.js');

    const buildExists = checkFileExists(paths.buildIndex, 'build/index.html');
    if (!buildExists) {
        log.warning('build/ ディレクトリが存在しません。npm run build を実行してください。');
    } else {
        checkFileExists(paths.buildManifest, 'build/manifest.json');
        checkFileExists(paths.buildServiceWorker, 'build/service-worker.js');
    }

    // ========================================
    // 2. manifest.json 検証
    // ========================================
    log.section('📄 manifest.json 検証');

    const publicManifest = validateJson(paths.publicManifest, 'public/manifest.json');
    if (publicManifest) {
        validateManifestFields(publicManifest, 'public');
        validateManifestIcons(publicManifest);
    }

    if (fs.existsSync(paths.buildManifest)) {
        const buildManifest = validateJson(paths.buildManifest, 'build/manifest.json');
        if (buildManifest) {
            validateManifestFields(buildManifest, 'build');
        }
    }

    // ========================================
    // 3. Service Worker 検証
    // ========================================
    log.section('⚙️  Service Worker 検証');

    if (fs.existsSync(paths.buildServiceWorker)) {
        validateServiceWorker(paths.buildServiceWorker);
    } else {
        log.error('Service Worker が見つかりません。npm run build を実行してください。');
        results.failed++;
        results.errors.push('Service Worker が生成されていません');
    }

    // ========================================
    // 4. package.json 検証
    // ========================================
    log.section('📦 package.json 検証');

    validatePackageJson();

    // ========================================
    // 5. アイコンファイル検証
    // ========================================
    log.section('🖼️  アイコンファイル検証');

    validateIconSize(paths.icon192, 192, 192);
    validateIconSize(paths.icon512, 512, 512);

    // ========================================
    // 6. パス整合性検証
    // ========================================
    log.section('🔗 パス整合性検証');

    validatePathConsistency();

    // ========================================
    // 結果サマリー
    // ========================================
    log.section('📊 検証結果サマリー');

    const total = results.passed + results.failed;
    const successRate = total > 0 ? ((results.passed / total) * 100).toFixed(2) : 0;

    console.log(`${colors.green}✅ 成功: ${results.passed}件${colors.reset}`);
    console.log(`${colors.red}❌ 失敗: ${results.failed}件${colors.reset}`);
    console.log(`${colors.yellow}⚠️  警告: ${results.warnings}件${colors.reset}`);
    console.log(`${colors.cyan}📈 成功率: ${successRate}%${colors.reset}\n`);

    if (results.failed === 0) {
        console.log(`${colors.green}
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║       ✅ PWA設定検証: すべて成功！                        ║
║                                                           ║
║   PWAの設定は完璧です。デプロイの準備ができています。    ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
${colors.reset}`);
    } else {
        console.log(`${colors.red}
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║       ❌ PWA設定検証: エラーが見つかりました              ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
${colors.reset}`);
        console.log(`${colors.red}エラー詳細:${colors.reset}`);
        results.errors.forEach((error, index) => {
            console.log(`  ${index + 1}. ${error}`);
        });
        console.log('');
    }

    if (results.warnings > 0) {
        console.log(`${colors.yellow}⚠️  警告: ${results.warnings}件の警告があります。確認を推奨します。${colors.reset}\n`);
    }

    // 終了コード
    process.exit(results.failed > 0 ? 1 : 0);
}

// 実行
main().catch((error) => {
    console.error(`${colors.red}予期しないエラー: ${error.message}${colors.reset}`);
    console.error(error.stack);
    process.exit(1);
});

