// tailwind.config.ts
module.exports = {
  theme: {
    extend: {
      transitionProperty: {
        'height': 'height',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
