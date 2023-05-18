import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, ViewChild } from '@angular/core';
import { Subject, debounceTime } from 'rxjs';

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
export class TextInputComponent {
  @ViewChild("textDiv") textDiv!: ElementRef;
  highlightedText!: string | null;
  debounceTrigger: Subject<void> = new Subject<void>();
  anchorSelection = 0;

  private greenRegex = /{[^{}]+}/g;
  private blueRegex = /\[([^\[\]]+)\]|\{([^{}]+)\}/g;
  private bracketsRegex = /[\[\]]/;
  private curlyRegex = /[{}]/;

  constructor(private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    this.debounceTrigger
      .pipe(debounceTime(1000))
      .subscribe(() => {
        this.handleHighlights();
      });
  }

  handleHighlights(): void {
    const text = this.textDiv.nativeElement.innerText;
    this.anchorSelection = window.getSelection()?.anchorOffset || 0;

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

    this.cdr.detectChanges();
    // Note for reviewer: change detection makes a problem about a contenteditable cursor,
    // it jumps to beginning, and I could not find a simple way to fix it.
    // There is a solution with window.getSelection method, but it requires
    // a heavy calculations about a cursor position.
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
