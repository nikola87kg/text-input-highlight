import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subject, Subscription, debounceTime } from 'rxjs';

enum SpecialChars {
  bracketOpen = '[',
  bracketClose = ']',
  bracketColor = 'blue',
  curlyOpen = '{',
  curlyClose = '}',
  curlyColor = 'green',
  parenthesesOpen = '(',
  parenthesesClose = ')',
  parenthesesColor = 'red',
}

@Component({
  selector: 'app-text-input',
  templateUrl: './text-input.component.html',
  styleUrls: ['./text-input.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TextInputComponent implements OnInit, OnDestroy {
  @ViewChild("textDiv") textDiv!: ElementRef;
  highlightedText!: string | null;
  debounceTrigger: Subject<void> = new Subject<void>();
  anchorSelection = 0;
  private subscription!: Subscription;
  openers = [
    SpecialChars.bracketOpen,
    SpecialChars.curlyOpen,
    SpecialChars.parenthesesOpen
  ];
  closers = [
    SpecialChars.bracketClose,
    SpecialChars.curlyClose,
    SpecialChars.parenthesesClose
  ];

  constructor(private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    this.subscription = this.debounceTrigger
      .pipe(debounceTime(300))
      .subscribe(() => {
        this.handleHighlights();
      });
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }

  handleHighlights(): void {
    const text = this.textDiv.nativeElement.innerText;

    this.highlightedText = this.getInnerHtml(text);

    const anchorIndex = this.getCursor();
    this.cdr.detectChanges();

    this.setCursor(anchorIndex);
  }

  getCursor(): number {
    const selection: Selection | null = window.getSelection();
    if (!selection) {
      return 0;
    }
    let element = selection?.anchorNode as any;
    if (element.parentNode.localName === 'span') {
      element = element.parentNode;
    }
    const anchorOffset = selection?.anchorOffset || 0;
    const parent = document.getElementById("highlight-input");
    let nodeIndex = 0;
    let anchorIndex = 0;

    if (parent && element) {
      nodeIndex = Array.from(parent?.childNodes).indexOf(element);

      const nodeLength = parent?.childNodes?.length || 0;
      for (let i = 0; i < nodeLength; i++) {
        const n: any = parent?.childNodes[i];
        const nodeData = n.data || n.innerText;

        const nodeLength = nodeData?.length || 0;
        if (nodeIndex > i) {
          anchorIndex += nodeLength;
          continue;
        }
        anchorIndex += anchorOffset;
        break;
      }
    }

    return anchorIndex;

  }

  setCursor(anchorIndex: number) {
    const parent = document.getElementById("highlight-input");
    const range = document.createRange();
    const sel = window.getSelection();

    if (parent && sel) {
      let nodeIndex = 0;
      let selectionIndex = 0;
      let currentLength = 0;

      const nodeLength = parent?.childNodes?.length || 0;

      for (let i = 0; i < nodeLength; i++) {
        const n: any = parent?.childNodes[i];
        const nodeData = n.data || n.innerText;
        const nodeLength = nodeData?.length || 0;
        if (anchorIndex > (nodeLength + currentLength)) {
          currentLength += nodeLength;
          continue;
        }
        nodeIndex = i;
        selectionIndex = anchorIndex - currentLength;
        break;
      }

      const node = parent.childNodes[nodeIndex]?.firstChild
        || parent.childNodes[nodeIndex];

      if (node) {
        range.setStart(node, selectionIndex);
        range.collapse(true);

        sel.removeAllRanges();
        sel.addRange(range);
      }

    };
  }

  getInnerHtml(text: string): any {
    let innerHtml: string = '';
    let highlightCandidate = '';
    let openHighlight = false;
    let activeOpener = '';

    for (let i = 0; i < text.length; i++) {
      const char = text[i] as any;

      if (openHighlight && this.openers.includes(char)) {
        innerHtml += highlightCandidate;
        highlightCandidate = char;
        activeOpener = char;

      } else if (openHighlight && char && char === this.getCloser(activeOpener)) {
        highlightCandidate += char;
        innerHtml += this.getColorWrapper(highlightCandidate);
        highlightCandidate = '';
        openHighlight = false;
        activeOpener = '';

      } else if (openHighlight && char && this.closers.includes(char)) {
        highlightCandidate += char;
        innerHtml += highlightCandidate;
        highlightCandidate = '';
        openHighlight = false;
        activeOpener = '';

      } else if (!openHighlight && this.openers.includes(char)) {
        highlightCandidate = char;
        openHighlight = true;
        activeOpener = char;

      } else if (openHighlight) {
        highlightCandidate += char;

      } else if (!openHighlight) {
        innerHtml += char;
      }

    }
    return innerHtml;
  }

  getCloser(char: string) {
    let closer = '';
    switch (char) {
      case SpecialChars.bracketOpen:
        closer = SpecialChars.bracketClose;
        break;
      case SpecialChars.curlyOpen:
        closer = SpecialChars.curlyClose;
        break;
      case SpecialChars.parenthesesOpen:
        closer = SpecialChars.parenthesesClose;
        break;
    }
    return closer;
  }

  getColorWrapper(input: string): string {
    const firstChar = input.charAt(0);
    let color = '';
    switch (firstChar) {
      case SpecialChars.bracketOpen:
        color = SpecialChars.bracketColor;
        break;
      case SpecialChars.curlyOpen:
        color = SpecialChars.curlyColor;
        break;
      case SpecialChars.parenthesesOpen:
        color = SpecialChars.parenthesesColor;
        break;
    }
    return `<span class="highlight-${color}">${input}</span>`;
  }
}
