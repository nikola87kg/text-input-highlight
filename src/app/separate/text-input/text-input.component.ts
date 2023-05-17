import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';

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
export class TextInputComponent implements OnInit {
  highlightedText!: string | null;
  inputControl: FormControl<string>;
  inputTextHandler: (text: string) => void;

  constructor() {
    this.inputControl = new FormControl<string>('', { nonNullable: true });
    this.inputTextHandler = (text: string) => this.handleHighlights(text);
  }

  ngOnInit(): void {
    this.listenInputChanges();
  }

  listenInputChanges() {
    this.inputControl
      .valueChanges
      .subscribe(this.inputTextHandler);
  }

  handleHighlights(text: string): void {
    const greenRegex = /\{(.*?)\}/g;
    const greenMatches = this.getHighlights(text, Colors.green, greenRegex);

    const blueRegex = /\[(.*?)\]/g;
    const blueMatches = this.getHighlights(text, Colors.blue, blueRegex);

    const highlights: Highlight[] = [...greenMatches, ...blueMatches];

    this.highlightedText = this.getInnerHtml(highlights, text);
  }

  getHighlights(text: string, color: Colors, regex: RegExp): Highlight[] {
    const highlights: Highlight[] = [];
    const matches = [...text.matchAll(regex)];
    matches.forEach((match) => {
      const start = match.index || 0;
      const end = start + match[0].length;
      const input = match.input?.substring(start, end) || '';
      highlights.push({ color, start, end, input });
    });
    return highlights;
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
