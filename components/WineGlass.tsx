import * as React from 'react';
import {Animated, Easing, Image, StyleSheet, Text, View} from 'react-native';
//@ts-ignore
import { distance2D, Point2D, Point3D } from '../math/utils';
//@ts-ignore
import HexGrid from '../math/HexGrid';
//@ts-ignore
import Distorter from '../math/Distorter';
import PanView from './PanView';
import Bubble from './Bubble';

type BubbleInfo<T> = {
  element: Bubble,
  position: Point3D,
  data: T,
  index: number,
};

type DefaultProps = {
  bubbleDistance: number,
  bubbleSize: number,
  initialFocus: boolean,
  sphereRadius: number,
  focusZoomScale: number,
};

type Props<T> = DefaultProps & {
  data: Array<T>,
  onItemFocus: (item: T, index: number) => void,
  onItemBlur: () => void,
  renderItem: (info: { item: T, index: number }) => React.ReactChild,
};

class WineGlass<T> extends React.Component<Props<T>, void> {

  bubbles: Array<BubbleInfo<T>> = [];

  width: number = 0;

  height: number = 0;

  distort: any;

  pan: Point2D = { x: 0, y: 0 };

  focusedBubble: any = null;

  zoomProgressAnim: Animated.Value = new Animated.Value(0);

  // from 0 to 1
  zoomProgress: number = 0;

  grid: Object;

  panElement: any;

  animationFrame: any;

  animatedValues: Array<Animated.Value> = [];

  static defaultProps = {
    bubbleDistance: 120,
    bubbleSize: 100,
    initialFocus: false,
    sphereRadius: 500,
    focusZoomScale: 3.2,
    onItemFocus: null,
    onItemBlur: null,
  };

  constructor(props: Props<T>) {
    super(props);
    this.grid = HexGrid(props.bubbleDistance / Math.sqrt(3));
  }

  componentDidMount() {
    this.zoomProgressAnim.addListener(({ value }) => {
      this.zoomProgress = value;
      this.requestUpdateNative();
    });
  }

  componentWillUnmount() {
    this.zoomProgressAnim.removeAllListeners();
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
    this.animatedValues.forEach(animatedValue => {
      animatedValue.removeAllListeners();
    });
  }

  shouldComponentUpdate(nextProps: Props<T>) {
    // TODO handle rerender properly for WineGlass
    return false;
  }

  //@ts-ignore
  get center(): Point2D {
    return {
      x: this.width / 2,
      y: this.height / 2,
    };
  }

  findNearestBubble(x: number, y: number) {
    const offset = { x, y };

    //@ts-ignore
    let nearest = null;
    this.bubbles.forEach(({ position }) => {
      if (
        //@ts-ignore
        nearest === null ||
        //@ts-ignore
        distance2D(offset, position) < distance2D(offset, nearest)
      ) {
        nearest = position;
      }
    });
    return nearest || { x: 0, y: 0 };
  }

  requestUpdateNative() {
    // drop frame if there's already an animation frame
    if (this.animationFrame) {
      return;
    }
    this.animationFrame = requestAnimationFrame(() => {
      this.animationFrame = null;
      this.updateNative();
    });
  }

  updateNative() {
    const zoom = 1 + this.zoomProgress * (this.props.focusZoomScale - 1);
    this.distort = Distorter(
      this.props.sphereRadius * zoom,
      this.width,
      this.height,
      zoom,
    );
    this.bubbles.forEach(_ => this.updateBubbleNative(_));
  }

  updateBubbleNative(bubbleInfo: BubbleInfo<T>) {
    const { x, y, z } = this.distort({
      x: bubbleInfo.position.x + this.pan.x,
      y: bubbleInfo.position.y + this.pan.y,
      z: bubbleInfo.position.z,
    });
    const blurredStrength = Math.min(
      1,
      distance2D({ x, y }, { x: 0, y: 0 }) / this.props.bubbleDistance,
    );
    const blurredOpacity = 1 - this.zoomProgress * blurredStrength * 0.8;
    if (bubbleInfo.element) {
      bubbleInfo.element.setPosition(
        {
          x: x + this.center.x,
          y: y + this.center.y,
          z,
        },
        blurredOpacity,
      );
    }
  }

  initializeAnimation() {
    this.startEnterAnimations();
    if (this.props.initialFocus && this.bubbles.length > 0) {
      this.enterFocus(this.bubbles[0]);
    }
  }

  startEnterAnimations() {
    Animated.stagger(
      100,
      this.bubbles.map((bubbleInfo: BubbleInfo<T>) => {
        const position = bubbleInfo.position;
        const progress = new Animated.Value(0);
        progress.addListener(({ value }) => {
          position.z = value * this.props.bubbleSize;
          this.updateBubbleNative(bubbleInfo);
        });
        this.animatedValues.push(progress);
        return Animated.timing(progress, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
          easing: Easing.out(Easing.quad),
        });
      }),
    ).start(() => {
      // clear listeners
      this.animatedValues.forEach(animatedValue => {
        animatedValue.removeAllListeners();
      });
    });
  }

  enterFocus(bubble: BubbleInfo<T>) {
    if (!this.focusedBubble) {
      this.zoomProgressAnim.stopAnimation(() => {
        Animated.spring(this.zoomProgressAnim, {
          toValue: 1,
          useNativeDriver: true
        }).start(({ finished }) => {
          if (
            finished &&
            this.props.onItemFocus &&
            this.focusedBubble === bubble
          ) {
            this.props.onItemFocus(bubble.data, bubble.index);
          }
        });
      });
      this.focusedBubble = bubble;
    } else if (this.focusedBubble !== bubble) {
      if (this.props.onItemFocus) {
        this.props.onItemFocus(bubble.data, bubble.index);
      }
      this.focusedBubble = bubble;
    }
  }

  exitFocus() {
    if (this.focusedBubble) {
      this.zoomProgressAnim.stopAnimation(() => {
        Animated.spring(this.zoomProgressAnim, {
          toValue: 0,
          useNativeDriver: true
        }).start();
      });
      if (this.props.onItemBlur) {
        this.props.onItemBlur();
      }
    }
    this.focusedBubble = null;
  }

  onLayout = (event: any) => {
    this.width = event.nativeEvent.layout.width;
    this.height = event.nativeEvent.layout.height;
    this.distort = Distorter(
      this.props.sphereRadius,
      this.width,
      this.height,
      1,
    );
    this.requestUpdateNative();
    this.initializeAnimation();
  };

  onPan = (x: number, y: number, dragging: boolean) => {
    this.pan = { x, y };
    if (dragging) {
      this.exitFocus();
    }
    this.requestUpdateNative();
  };

  onPanViewPress = () => {
    this.exitFocus();
  };

  findSnapPoint = (x: number, y: number) => this.findNearestBubble(x, y);

  onBubblePress = (index: number) => {
    const bubble = this.bubbles[index];
    const invertedPan = {
      x: -this.pan.x,
      y: -this.pan.y,
    };
    // pan to bubble position
    if (distance2D(invertedPan, bubble.position) > 10 && this.panElement) {
      this.panElement.setPan(bubble.position.x, bubble.position.y);
    }
    // focus on bubble
    this.enterFocus(bubble);
  };

  renderBubble(coord: Point2D, item: T, index: number) {
    const position = {
      x: coord.x,
      y: coord.y,
      z: 0,
    };
    return (
        <Bubble
            ref={element => {
              this.bubbles[index] = {
                //@ts-ignore
                element,
                position,
                data: item,
                index,
              };
            }}
            key={index}
            initialPosition={{ x: 0, y: 0, z: 0 }}
            onPress={() => {
              this.onBubblePress(index);
            }}
        >
          {this.props.renderItem({  index,item })}
        </Bubble>

    );
  }

  render() {
    const bubbles = this.grid
      //@ts-ignore
      .coords(this.props.data.length)
      //@ts-ignore
      .map((coord, index) =>
        this.renderBubble(coord, this.props.data[index], index),
      );

    return (
      //@ts-ignore
      <PanView
        ref={element => {
          this.panElement = element;
        }}
        style={styles.container}
        onLayout={this.onLayout}
        onPan={this.onPan}
        onPress={this.onPanViewPress}
        findSnapPoint={this.findSnapPoint}
      >
        {bubbles}
      </PanView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignSelf: 'stretch',
  },
});

export default WineGlass;
