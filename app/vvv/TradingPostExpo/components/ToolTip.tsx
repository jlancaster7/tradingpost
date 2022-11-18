import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Button, Layout, Tooltip, Text } from '@ui-kitten/components';
import { InfoIcon } from '../images';

export const TooltipComponent = (props: {text: string}) => {

  const [visible, setVisible] = useState(false);

  const renderToggleButton = () => {
    return (
        <Button 
            appearance='ghost'
            accessoryLeft={<InfoIcon height={24} width={24}  style={{ marginHorizontal: 0 }} />}
            style={{paddingHorizontal: 0, paddingVertical: 0, minHeight: 0, minWidth: 0}}
            onPress={() => setVisible(true)}>
            {''}
        </Button>

  ) as React.ReactElement};
  return (
    <View style={{justifyContent: 'center',
                    alignItems: 'flex-start',
                    flex: 1
                    }}>
        <Tooltip
            anchor={renderToggleButton}
            style={{ translateY: 37,  translateX: -15, width: '70%', height: '130%'}}
            backdropStyle={{backgroundColor: 'rgba(0, 0, 0, 0.5)'}}
            placement={'right'}
            visible={visible}
            onBackdropPress={() => setVisible(false)}
            >
            <Text>{props.text}</Text>
        </Tooltip>
    </View>
  );
};