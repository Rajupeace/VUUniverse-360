// ============================================================
// AWS Deployment Script — FBN XAI Project
// Deploys: Frontend (S3) + Backend (Elastic Beanstalk)
// Run: node deploy-aws.js
// ============================================================

require('dotenv').config();
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const BUCKET = process.env.AWS_S3_BUCKET || 'fnb-xai-project-files';
const REGION = process.env.AWS_REGION || 'us-east-1';
const EB_APP = process.env.AWS_EB_APP_NAME || 'fnb-xai-project';
const EB_ENV = process.env.AWS_EB_ENV_NAME || 'fnb-xai-project-prod';

function run(cmd, label) {
    console.log(`\n🔄  ${label}...`);
    try {
        const out = execSync(cmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
        if (out) console.log(out);
        console.log(`✅  ${label} — Done`);
    } catch (e) {
        console.error(`❌  ${label} — Failed: ${e.stderr || e.message}`);
        throw e;
    }
}

async function main() {
    console.log('\n🚀  FBN XAI Project — AWS Cloud Deployment');
    console.log('═'.repeat(50));
    console.log(`   Region  : ${REGION}`);
    console.log(`   Bucket  : ${BUCKET}`);
    console.log(`   EB App  : ${EB_APP}`);
    console.log(`   EB Env  : ${EB_ENV}\n`);

    // ── Step 1: Build React Frontend ────────────────────────────
    run('npm run build', '1/4  Building React frontend');

    // ── Step 2: Upload Frontend to S3 ───────────────────────────
    run(
        `aws s3 sync build/ s3://${BUCKET}-frontend/ --region ${REGION} --delete --acl public-read`,
        '2/4  Uploading frontend to S3'
    );

    // ── Step 3: Configure S3 Website Hosting ──────────────────
    run(
        `aws s3 website s3://${BUCKET}-frontend/ --index-document index.html --error-document index.html --region ${REGION}`,
        '3/4  Enabling S3 static website hosting'
    );

    // ── Step 4: Deploy Backend to Elastic Beanstalk ──────────────
    console.log('\n🔄  4/4  Deploying backend to Elastic Beanstalk...');
    console.log('    (This may take 3-5 minutes on first deploy)\n');
    run('cd backend && eb deploy', '4/4  Backend deployment to EB');

    // ── Done ─────────────────────────────────────────────────────
    console.log('\n🎉  DEPLOYMENT COMPLETE!');
    console.log('═'.repeat(50));
    console.log(`\n🌐  Frontend URL : http://${BUCKET}-frontend.s3-website-${REGION}.amazonaws.com`);
    console.log(`⚙️   Backend URL  : Check AWS Elastic Beanstalk console for your environment URL`);
    console.log('\n📊  AWS Console  : https://console.aws.amazon.com\n');
}

main().catch(err => {
    console.error('\n💥  Deployment failed:', err.message);
    process.exit(1);
});
