import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subject, Subscription, debounceTime } from 'rxjs';

interface HighlightProps {
  text: string,
  color: Colors,
  regex: RegExp,
  ignoreRegex: RegExp,
}

interface Highlight {
  color: string,
  start: number,
  end: number,
  input: string,
}

enum Colors {
  green = 'green',
  blue = 'blue',
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

  private greenRegex = /{[^{}]+}/g;
  private blueRegex = /\[([^\[\]]+)\]|\{([^{}]+)\}/g;
  private bracketsRegex = /[\[\]]/;
  private curlyRegex = /[{}]/;
  private subscription!: Subscription;

  constructor(private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    this.subscription = this.debounceTrigger
      .pipe(debounceTime(1000))
      .subscribe(() => {
        this.handleHighlights();
      });
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }

  handleHighlights(): void {
    const text = this.textDiv.nativeElement.innerText;

    const greenProps: HighlightProps = {
      text,
      color: Colors.green,
      regex: this.greenRegex,
      ignoreRegex: this.bracketsRegex
    };

    const greenMatches = this.getHighlights(greenProps);

    const blueProps: HighlightProps = {
      text,
      color: Colors.blue,
      regex: this.blueRegex,
      ignoreRegex: this.curlyRegex
    };

    const blueMatches = this.getHighlights(blueProps);

    const highlights: Highlight[] = [
      ...greenMatches,
      ...blueMatches
    ];

    this.highlightedText = this.getInnerHtml(highlights, text);

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

  getHighlights(props: HighlightProps): Highlight[] {
    const highlights: Highlight[] = [];
    const matches: RegExpMatchArray[] = [...props.text.matchAll(props.regex)];

    matches.forEach((match: RegExpMatchArray) => {
      const isMatchIgnored = this.testMatch(props.ignoreRegex, match[0]);
      if (isMatchIgnored) {
        return;
      }

      const start = match.index || 0;
      const end = start + match[0].length;
      const input = match.input?.substring(start, end) || '';
      const color = props.color;
      highlights.push({ color, start, end, input });
    });

    return highlights;
  }

  testMatch(regex: RegExp, match: string): boolean {
    return regex.test(match);
  }

  getInnerHtml(highlights: Highlight[], text: string): string {
    let innerHtml = '';
    let lastTextIndex = 0;
    highlights.sort((a, b) => a.start - b.start);

    highlights.forEach((highlight) => {
      if (highlight.start > lastTextIndex) {
        innerHtml += text.substring(lastTextIndex, highlight.start);
        lastTextIndex = highlight.start;
      }

      if (lastTextIndex <= highlight.start) {
        innerHtml += this.getColorWrapper(highlight);
        lastTextIndex = highlight.end;
      }
    });

    if (lastTextIndex < text.length) {
      innerHtml += text.substring(lastTextIndex, text.length);
    }

    return innerHtml;
  }

  getColorWrapper(highlight: Highlight): string {
    return `<span class="highlight-${highlight.color}">${highlight.input}</span>`;
  }
}
