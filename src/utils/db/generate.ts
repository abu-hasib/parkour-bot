export default function generatePrompt(animal: string) {
    const capitalizedAnimal =
      animal[0].toUpperCase() + animal.slice(1).toLowerCase();
    return `Create a job description for a some key words I give to you.
    
    Keywords: fullstack vue node 5
    Job description: Our tech stack:
    Frontend: Vue.js, styled-components, Storybook, Cypress
    Backend: TypeScript/Node.js, Next.js, Express.js, Docusaurus, Meteor.js, Jest
  
    You have a strong technical background or a great professional track record
    5 years of industry experience building the backend and frontend systems
    Ready to learn JavaScript quickly
    Knowledge of any technologies
    Good communication skills in English
    Keywords: frontend react tailwindcss 2
    Job description: 🏆 Who You Are
    Ideally you have 2+ years experience with React Native or React
    An understanding of functional components and hooks
    Foundational knowledge of git, CSS and HTML are a must
    Bonus: experience with Firebase, Web Frameworks or Tailwind 
    A brilliant communicator - you are not afraid to tell if something is going in the wrong direction and you want to correct early on
    Keywords: ${capitalizedAnimal}
    Job description:`;
  }