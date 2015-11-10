import { execute, describe, create, upsert, reference, steps } from './src/adaptor';

execute({
  connectionOptions: {
    accessToken: ""
  },

  credentials: {
    username: '',
    password: '',
    securityToken: ""
  }
},
  {{{expression}}}
);
