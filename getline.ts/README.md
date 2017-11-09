Getline Typescript Client Library
=================================

    yarn
    yarn generate
    yarn build

    import { Client } from './getline.ts';
    let c = new Client("http://metabackend-provider:2080");
    let loans = await c.getLoansByOwner("0x....");

