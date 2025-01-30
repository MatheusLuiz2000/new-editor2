export type ComponentType = 'heading' | 'paragraph' | 'image' | 'button' | 'container';

interface BaseProps {
  id: string;
}

interface HeadingProps extends BaseProps {
  text: string;
  level: 1 | 2 | 3 | 4 | 5 | 6;
}

interface ParagraphProps extends BaseProps {
  text: string;
}

interface ImageProps extends BaseProps {
  src: string;
  alt: string;
}

interface ButtonProps extends BaseProps {
  text: string;
  variant: 'primary' | 'secondary';
}

interface ContainerProps extends BaseProps {
  title: string;
}

export type ComponentProps = HeadingProps | ParagraphProps | ImageProps | ButtonProps | ContainerProps;

export interface PageComponent {
  id: string;
  type: ComponentType;
  props: ComponentProps;
  children?: PageComponent[];
} 
