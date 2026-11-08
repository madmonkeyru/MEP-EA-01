import { TextRenderer } from '../../../components/common/TextRenderer';

/** The lesson pack supports inline emphasis and the app's existing math notation. */
export function LearningText({ content = '', inline = false }: { content?: string; inline?: boolean }) {
  const Wrapper = inline ? 'span' : 'div';
  return <Wrapper className="min-w-0">{content.split(/(\*\*[^*]+\*\*)/g).map((part, index) =>
    part.startsWith('**') && part.endsWith('**')
      ? <strong key={index}><TextRenderer content={part.slice(2,-2)} inline /></strong>
      : <TextRenderer key={index} content={part} inline />)}</Wrapper>;
}
