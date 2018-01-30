
export default {
    path: '/mycontacts/',
    name: 'MyContacts',
    component: resolve => require(['../pages/contacts/MyContacts.vue'], resolve),
    redirect: { name: 'ContactsList' },
    children: [
      {
        path: 'list',
        name: 'ContactsList',
        component: resolve => require(['../pages/contacts/ContactsList.vue'], resolve),
      },
      {
        path: 'add',
        name: 'AddContact',
        component: resolve => require(['../pages/contacts/AddContact.vue'], resolve)
      },
      {
        path: 'modify/:id',
        name: 'ModifyContact',
        component: resolve => require(['../pages/contacts/ModifyContact.vue'], resolve)
      },
      {
        path: ':id',
        name: 'ContactDetails',
        component: resolve => require(['../pages/contacts/ContactDetails.vue'], resolve)
      },
    ]
  }