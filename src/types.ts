export type ComponentType = 'heading' | 'paragraph' | 'image' | 'button' | 'container';

export type DeviceType = 'desktop' | 'tablet' | 'mobile';

export type ResponsiveValue<T> = {
  desktop: T;
  tablet?: T;
  mobile?: T;
};

interface BaseProps {
  id: string;
}

interface HeadingProps extends BaseProps {
  text: string;
  level: 1 | 2 | 3 | 4 | 5 | 6;
  fontSize?: ResponsiveValue<string>;
  textAlign?: ResponsiveValue<'left' | 'center' | 'right'>;
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
  style?: ResponsiveValue<{
    width?: string;
    padding?: string;
    margin?: string;
    display?: string;
  }>;
}

export type ComponentProps = HeadingProps | ParagraphProps | ImageProps | ButtonProps | ContainerProps;

export interface PageComponent {
  id: string;
  type: ComponentType;
  props: ComponentProps;
  children?: PageComponent[];
} 
