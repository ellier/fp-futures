# fp-futures
Functional programming example for team

## Libraries
- Fluture
- Sactuary

### Purpose
The purpose of this is to show how to make asynchronous calls to an api that limits the number of calls per second in a functinal programming way. We also try to show how to use monads to handle api errors.

### Use case
Long running processes that need to get data from external resources where a throttling is enforced, ex., solar vendor data and Salesforce.