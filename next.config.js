/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    config.resolve.fallback = { fs: false, net: false, tls: false };

    if (!isServer) {
      config.externals.push('pino-pretty', 'lokijs', 'encoding');
    }

    // Ignore React Native dependencies in MetaMask SDK
    config.resolve.alias = {
      ...config.resolve.alias,
      '@react-native-async-storage/async-storage': false,
    };

    // Handle @walletconnect modules properly
    config.resolve.alias = {
      ...config.resolve.alias,
      '@walletconnect/modal': '@walletconnect/modal',
      '@walletconnect/modal-core': '@walletconnect/modal-core',
      '@walletconnect/modal-ui': '@walletconnect/modal-ui',
    };

    return config;
  },
  // Transpile WalletConnect packages
  transpilePackages: [
    '@reown/appkit',
    '@reown/appkit-adapter-wagmi',
    '@walletconnect/modal',
    '@walletconnect/modal-core',
    '@walletconnect/modal-ui',
    '@web3modal/wagmi',
  ],
};

module.exports = nextConfig;
