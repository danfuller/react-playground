const isGithubActions = process.env.GITHUB_ACTIONS || false

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: isGithubActions ? '/react-playground' : '',
  assetPrefix: isGithubActions ? '/react-playground' : ''
}

module.exports = nextConfig
