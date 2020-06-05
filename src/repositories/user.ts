import { ApolloClient } from 'apollo-client';
import { InMemoryCache, NormalizedCacheObject } from 'apollo-cache-inmemory';
import { HttpLink } from 'apollo-link-http';

export default class UserRepository {
    private api: ApolloClient<NormalizedCacheObject>;

    constructor() {
        let cache = new InMemoryCache();
        let link = new HttpLink({ uri: 'localhost' });
        this.api = new ApolloClient<NormalizedCacheObject>({
            cache: cache,
            link: link,
        });
    }
}