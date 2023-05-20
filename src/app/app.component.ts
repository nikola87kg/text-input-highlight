import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  isVisible = true;
  sampleContent = `Hi. {AliasRepName} here. [I'd like to buy/I want to acquire] {PropertyAddress}. To make it easy, I [can pay
    upfront/am willing to pay upfront] and [we can close/we can be done/we can finish] [quickly/soon/whenever you want].
    (Any interest)?`;

  sampleTest = `(test) {test} [test] {{test}} [[test]] [te{s}t] {te[s]t} {te[s} te((te)[s]t) (te[st)]}`;
}
