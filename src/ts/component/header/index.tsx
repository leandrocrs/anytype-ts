import * as React from 'react';
import { I, UtilObject, Renderer, keyboard, sidebar, Preview, translate } from 'Lib';
import { Icon } from 'Component';
import { popupStore, menuStore } from 'Store';

import HeaderAuthIndex from './auth';
import HeaderMainObject from './main/object';
import HeaderMainHistory from './main/history';
import HeaderMainGraph from './main/graph';
import HeaderMainNavigation from './main/navigation';
import HeaderMainStore from './main/store';
import HeaderMainEmpty from './main/empty';

interface Props extends I.HeaderComponent {
	component: string;
	className?: string;
};

const Components = {
	authIndex:			 HeaderAuthIndex,
	mainObject:			 HeaderMainObject,
	mainHistory:		 HeaderMainHistory,
	mainGraph:			 HeaderMainGraph,
	mainNavigation:		 HeaderMainNavigation,
	mainStore:			 HeaderMainStore,
	mainEmpty:			 HeaderMainEmpty,
};

class Header extends React.Component<Props> {

	refChild: any = null;

	constructor (props: Props) {
		super(props);

		this.menuOpen = this.menuOpen.bind(this);
		this.renderLeftIcons = this.renderLeftIcons.bind(this);
		this.renderTabs = this.renderTabs.bind(this);
		this.onSearch = this.onSearch.bind(this);
		this.onTooltipShow = this.onTooltipShow.bind(this);
		this.onTooltipHide = this.onTooltipHide.bind(this);
		this.onDoubleClick = this.onDoubleClick.bind(this);
		this.onExpand = this.onExpand.bind(this);
	};
	
	render () {
		const { component, className, rootId } = this.props;
		const Component = Components[component] || null;
		const cn = [ 'header', component, className ];

		if (![ 'authIndex', 'mainIndex' ].includes(component)) {
			cn.push('isCommon');
		};

		return (
			<div id="header" className={cn.join(' ')} onDoubleClick={this.onDoubleClick}>
				<Component 
					ref={ref => this.refChild = ref} 
					{...this.props} 
					onSearch={this.onSearch}
					onTooltipShow={this.onTooltipShow}
					onTooltipHide={this.onTooltipHide}
					menuOpen={this.menuOpen}
					renderLeftIcons={this.renderLeftIcons}
					renderTabs={this.renderTabs}
				/>
			</div>
		);
	};

	componentDidMount () {
		sidebar.resizePage();
	};

	componentDidUpdate () {
		sidebar.resizePage();
		this.refChild.forceUpdate();
	};

	renderLeftIcons (onOpen?: () => void) {
		const cmd = keyboard.cmdSymbol();

		return (
			<React.Fragment>
				<Icon
					className="toggle"
					tooltip={translate('sidebarToggle')}
					tooltipCaption={`${cmd} + \\, ${cmd} + .`}
					tooltipY={I.MenuDirection.Bottom}
					onClick={() => sidebar.toggleExpandCollapse()}
				/>

				<Icon 
					className="expand" 
					tooltip={translate('commonOpenObject')} 
					onClick={onOpen || this.onExpand} 
				/>
			</React.Fragment>
		);
	};

	renderTabs () {
		const { tab, tabs, onTab } = this.props;

		return (
			<div id="tabs" className="tabs">
				{tabs.map((item: any, i: number) => (
					<div 
						key={i}
						className={[ 'tab', (item.id == tab ? 'active' : '') ].join(' ')} 
						onClick={() => onTab(item.id)}
						onMouseOver={e => this.onTooltipShow(e, item.tooltip, item.tooltipCaption)} 
						onMouseOut={this.onTooltipHide}
					>
						{item.name}
					</div>
				))}
			</div>
		);
	};

	onExpand () {
		const { rootId, layout } = this.props;

		popupStore.closeAll(null, () => UtilObject.openRoute({ id: rootId, layout }));
	};

	onSearch () {
		keyboard.onSearchPopup('Header');
	};

	onTooltipShow (e: any, text: string, caption?: string) {
		const t = Preview.tooltipCaption(text, caption);
		if (t) {
			Preview.tooltipShow({ text: t, element: $(e.currentTarget), typeY: I.MenuDirection.Bottom });
		};
	};

	onTooltipHide () {
		Preview.tooltipHide(false);
	};

	onDoubleClick () {
		Renderer.send('winCommand', 'maximize');
	};

	menuOpen (id: string, elementId: string, param: Partial<I.MenuParam>) {
		const { isPopup } = this.props;
		const st = $(window).scrollTop();
		const element = $(`${this.getContainer()} ${elementId}`);
		const menuParam: any = Object.assign({
			element,
			offsetY: 4,
		}, param);

		if (!isPopup) {
			menuParam.fixedY = element.offset().top + element.height() - st + 4;
			menuParam.classNameWrap = 'fixed fromHeader';
		};

		menuStore.closeAllForced(null, () => menuStore.open(id, menuParam));
	};

	getContainer () {
		return (this.props.isPopup ? '.popup' : '') + ' .header';
	};

};

export default Header;