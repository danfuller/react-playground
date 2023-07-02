const isGithubActions = process.env.GITHUB_ACTIONS || false

/** @type {import('next').NextConfig} */
const nextConfig = {
  appDir: true,
  output: 'export',
  basePath: isGithubActions ? '/react-playground' : '',
}

module.exports = nextConfig
