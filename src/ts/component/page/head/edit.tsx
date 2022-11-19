import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { observer } from 'mobx-react';
import $ from 'jquery';
import { I, M, C, DataUtil, analytics } from 'Lib';
import { Block, Drag, Button } from 'Component';
import { blockStore, detailStore } from 'Store';

interface Props extends I.BlockComponent {
	setLayoutWidth?(v: number): void;
};


const PageHeadEdit = observer(class PageHeadEdit extends React.Component<Props, {}> {
	
	refDrag: any = null;

	constructor (props: any) {
		super(props);

		this.setPercent = this.setPercent.bind(this);
		this.onScaleStart = this.onScaleStart.bind(this);
		this.onScaleMove = this.onScaleMove.bind(this);
		this.onScaleEnd = this.onScaleEnd.bind(this);
		this.onClone = this.onClone.bind(this);
	};

	render (): any {
		const { rootId, onKeyDown, onKeyUp, onMenuAdd, onPaste, readonly } = this.props;
		const root = blockStore.getLeaf(rootId, rootId);

		if (!root) {
			return null;
		};

		const check = DataUtil.checkDetails(rootId);
		const object = check.object;
		const header = blockStore.getLeaf(rootId, 'header') || {};
		const cover = new M.Block({ id: rootId + '-cover', type: I.BlockType.Cover, hAlign: object.layoutAlign, childrenIds: [], fields: {}, content: {} });
		const icon: any = new M.Block({ id: rootId + '-icon', type: I.BlockType.IconPage, hAlign: object.layoutAlign, childrenIds: [], fields: {}, content: {} });
		const templateIsBundled = object.templateIsBundled;

		if (root.isObjectHuman()) {
			icon.type = I.BlockType.IconUser;
		};

		let note = null;
		if (templateIsBundled) {
			note = (
				<div id="note" className="note">
					<div className="inner">
						<div className="sides">
							<div className="side left">
								This template cannot be changed, because it is Basic for this object type.<br />
								If you want to edit, create a Duplicate of this template.
							</div>
							<div className="side right">
								<Button color="dark" text="Duplicate" onClick={this.onClone} />
							</div>
						</div>
					</div>
				</div>
			);
		}

		return (
			<div>
				<div id="editorSize" className="dragWrap">
					<Drag 
						ref={(ref: any) => { this.refDrag = ref; }} 
						value={root.fields.width}
						snap={0.5}
						onStart={this.onScaleStart} 
						onMove={this.onScaleMove} 
						onEnd={this.onScaleEnd} 
					/>
					<div id="dragValue" className="number">100%</div>
				</div>

				{note}

				{check.withCover ? <Block {...this.props} key={cover.id} block={cover} className="noPlus" /> : ''}
				{check.withIcon ? <Block {...this.props} key={icon.id} block={icon} className="noPlus" /> : ''}

				<Block 
					key={header.id} 
					{...this.props}
					readonly={readonly}
					index={0}
					block={header}
					onKeyDown={onKeyDown}
					onKeyUp={onKeyUp}  
					onMenuAdd={onMenuAdd}
					onPaste={onPaste}
				/>
			</div>
		);
	};

	componentDidMount () {
		const { rootId } = this.props;
		const root = blockStore.getLeaf(rootId, rootId);

		this.init();

		if (root && this.refDrag) {
			this.refDrag.setValue(root.fields.width);
		};
	};

	componentDidUpdate () {
		this.init();
	};

	init () {
		const { rootId, getWrapper } = this.props;
		const check = DataUtil.checkDetails(rootId);

		getWrapper().attr({ class: [ 'editorWrapper', check.className ].join(' ') });
		$(window).trigger('resize.editor');
	};

	onScaleStart (e: any, v: number) {
		const { dataset } = this.props;
		const { selection } = dataset || {};
		
		selection.preventSelect(true);
		this.setPercent(v);
	};
	
	onScaleMove (e: any, v: number) {
		this.props.setLayoutWidth(v);
		this.setPercent(v);
	};
	
	onScaleEnd (e: any, v: number) {
		const { rootId, dataset } = this.props;
		const { selection } = dataset || {};

		selection.preventSelect(false);
		this.setPercent(v);

		C.BlockListSetFields(rootId, [
			{ blockId: rootId, fields: { width: v } },
		], () => {
			$('.resizable').trigger('resize', [ e ]);
		});
	};

	setPercent (v: number) {
		const node = $(ReactDOM.findDOMNode(this));
		const value = node.find('#dragValue');

		value.text(Math.ceil(v * 100) + '%');
	};

	onClone (e: any) {
		const { rootId } = this.props;
		const object = detailStore.get(rootId, rootId);

		C.TemplateClone(rootId, (message: any) => {
			if (message.id) {
				DataUtil.objectOpenRoute({ id: message.id });
			};

			analytics.event('CreateTemplate', { objectType: object.targetObjectType });
		});
	};

});

export default PageHeadEdit;