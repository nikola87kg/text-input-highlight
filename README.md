Implement a text input component where words wrapped in square brackets are highlighted in blue, and words wrapped in curly brackets are highlighted in green.

Overlapping patterns should be ignored.

The component should be implemented in a separate module of Angular application.

The application should be published on GitHub in a public repository.

For example:
[Hello/Hi/Greetings] {Name} is correct
[Hello {Surname}/Hi/Greetings] {Name} is wrong

Sample text:
Hi. {AliasRepName} here. [I'd like to buy/I want to to acquire] {PropertyAddress}. To make it easy, I [can pay upfront/am willing to pay upfront] and [we can close/we can be done/we can finish] [quickly/soon/whenever you want]. Any interest?
 
 {test} [test] {{test}} [[test]] [te{s}t] {te[s]t} {te[s} te]st}
