module.exports = {
  presets: [
    ['@babel/preset-env', {
      targets: {
        node: 'current'
      },
      modules: 'auto'
    }]
  ],
  plugins: [
    function() {
      return {
        visitor: {
          MetaProperty(path) {
            if (path.node.meta.name === 'import' && path.node.property.name === 'meta') {
              // Transform import.meta.env to process.env or global.import.meta.env
              const parent = path.parent;
              if (parent.property && parent.property.name === 'env') {
                // Replace with global.import.meta.env
                path.replaceWithSourceString('global.import.meta');
              }
            }
          }
        }
      };
    }
  ]
};

