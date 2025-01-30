// components/Component.jsx
import { useDrag } from 'react-dnd';
import { useStore } from '../store';

const Component = ({ data }) => {
  const { updateComponentPosition } = useStore();
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'COMPONENT',
    item: { id: data.id },
    end: (item, monitor) => {
      const offset = monitor.getClientOffset();
      if (offset) {
        updateComponentPosition(item.id, offset.x, offset.y);
      }
    },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      style={{
        position: 'absolute',
        left: data.x,
        top: data.y,
        opacity: isDragging ? 0.5 : 1,
      }}
      className="p-4 border-2 bg-white cursor-move"
    >
      {data.type === 'button' && <button>Button</button>}
      {data.type === 'text' && <p>Text Box</p>}
    </div>
  );
};

export default Component;
