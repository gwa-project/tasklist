module.exports = {
  apps: [
    {
      name: 'sena-rencar',
      script: 'npm',
      args: 'start',
      cwd: '/var/www/sena-rencar',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: '/var/log/sena-rencar/error.log',
      out_file: '/var/log/sena-rencar/out.log',
      log_file: '/var/log/sena-rencar/combined.log',
      time: true,
      max_restarts: 10,
      min_uptime: '10s',
      max_memory_restart: '1G',
      restart_delay: 4000,
      watch: false,
      ignore_watch: ['node_modules', '.next'],
    }
  ]
};